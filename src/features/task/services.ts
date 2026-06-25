"use server";

import { createServiceClient } from "@/configs/supabase-service";
import { fetchList, type QueryFilter } from "@/utils/fetch-list";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
	AttachmentUseFor,
	createAttachment,
	deleteAttachments,
} from "../attachment";
import { getLoggedUser } from "../auth/services";
import { TaskMemberType, TaskPriority, TaskStatus } from "./types";
import type {
	CreateTaskPayload,
	GetTasksParams,
	Task,
	TaskAssign,
	TaskListResult,
	TaskRow,
	TaskUpdate,
} from "./types";

/**
 * Gắn assignees (tasks_members + profile) vào 1 task row, ép kiểu status/priority.
 * Dùng chung cho getTasks / updateTask.
 */
async function mapTaskWithAssignees(
	supabase: SupabaseClient,
	row: TaskRow
): Promise<Task> {
	const { data: members } = await supabase
		.from("tasks_members")
		.select("*, user:profiles!tasks_members_user_id_fkey(*)")
		.eq("task_id", row.id);

	const assignees: TaskAssign[] = (members ?? []).map(m => {
		const { user: profile, ...memberRow } = m as Record<string, unknown> & {
			user: Record<string, unknown>;
		};
		return { ...memberRow, ...profile } as TaskAssign;
	});

	return {
		...row,
		status: row.status as TaskStatus,
		priority: row.priority as TaskPriority,
		assignees,
	};
}

/**
 * Lấy danh sách công việc của một dự án (kèm assignees = members + profile).
 * - Dùng `fetchList` cho filter/search/sort/pagination.
 * - `status`/`priority` nhận giá trị đơn hoặc mảng (kanban truyền 1 status/cột).
 */
export async function getTasks(
	params: GetTasksParams
): Promise<TaskListResult> {
	const { projectId, page = 1, limit = 20, search, status, priority } = params;

	const supabase = createServiceClient();
	const user = await getLoggedUser();

	if (!user) {
		throw new Error("Bạn cần đăng nhập để xem danh sách công việc.");
	}

	const filters: QueryFilter<TaskRow>[] = [
		{ key: "project_id", operator: "equal", value: projectId },
	];

	if (status) {
		filters.push({
			key: "status",
			operator: "in",
			value: Array.isArray(status) ? status : [status],
		});
	}

	if (priority) {
		filters.push({
			key: "priority",
			operator: "in",
			value: Array.isArray(priority) ? priority : [priority],
		});
	}

	const { data, count, error } = await fetchList<TaskRow>(supabase, "tasks", {
		page,
		limit,
		search,
		searchField: ["title"],
		orders: { created_at: true },
		filters,
	});

	if (error) {
		throw new Error(error.message ?? "Không thể tải danh sách công việc.");
	}

	const rows = data ?? [];

	const items = await Promise.all(
		rows.map(row => mapTaskWithAssignees(supabase, row))
	);

	return { items, total: count ?? 0 };
}

export async function getTaskById(_id: string): Promise<Task | null> {
	// TODO: implement single task query
	return null;
}

/**
 * Tạo công việc mới:
 * - Insert record `tasks` (description = html rich text).
 * - Thêm thành viên vào `tasks_members` (implement + watcher).
 * - Nếu html chứa ảnh blob: upload từng ảnh lên R2 theo cấu trúc
 *   `${userId}/projects/${projectId}/tasks/${taskId}`, thay blob URL bằng
 *   public URL trong html, ghi record `attachments`, rồi update lại description.
 * - Rollback theo chuỗi nếu có lỗi: attachments -> members -> task.
 */
export async function createTask(payload: CreateTaskPayload): Promise<Task> {
	const admin = createServiceClient();
	const user = await getLoggedUser();

	if (!user) {
		throw new Error("Bạn cần đăng nhập để tạo công việc.");
	}

	if (!payload.projectId) {
		throw new Error("Thiếu thông tin dự án.");
	}

	let html = payload.description ?? "";

	const { data: task, error } = await admin
		.from("tasks")
		.insert({
			project_id: payload.projectId,
			title: payload.title,
			description: html,
			status: payload.status,
			priority: payload.priority,
			due_at: payload.dueDate,
		})
		.select("*")
		.single();

	if (error) {
		throw new Error(error.message);
	}

	// Thêm thành viên: implement + watcher.
	const memberRows = [
		...payload.implementIds.map(userId => ({
			task_id: task.id,
			user_id: userId,
			type: TaskMemberType.IMPLEMENT,
		})),
		...payload.watcherIds.map(userId => ({
			task_id: task.id,
			user_id: userId,
			type: TaskMemberType.WATCHER,
		})),
	];

	if (memberRows.length > 0) {
		const { error: memberError } = await admin
			.from("tasks_members")
			.insert(memberRows);

		if (memberError) {
			await admin.from("tasks").delete().eq("id", task.id);
			throw new Error(memberError.message);
		}
	}

	// Upload ảnh trong html (chỉ ảnh blob còn xuất hiện trong html cuối cùng).
	const images = (payload.images ?? []).filter(img =>
		html.includes(img.blobUrl)
	);

	const createdAttachmentIds: number[] = [];

	if (images.length > 0) {
		const path = `${user.id}/${AttachmentUseFor.PROJECT}/${payload.projectId}/${AttachmentUseFor.TASK}/${task.id}`;

		try {
			for (const img of images) {
				const attachment = await createAttachment({
					file: img.file,
					useFor: AttachmentUseFor.TASK,
					targetId: task.id,
					uploaderId: user.id,
					path,
				});

				createdAttachmentIds.push(attachment.id);
				html = html.replaceAll(img.blobUrl, attachment.url);
			}

			const { error: updateError } = await admin
				.from("tasks")
				.update({ description: html })
				.eq("id", task.id);

			if (updateError) {
				throw new Error(updateError.message);
			}
		} catch (uploadError) {
			// Rollback: attachments -> members -> task.
			if (createdAttachmentIds.length > 0) {
				await deleteAttachments(createdAttachmentIds).catch(
					() => undefined
				);
			}
			await admin.from("tasks_members").delete().eq("task_id", task.id);
			await admin.from("tasks").delete().eq("id", task.id);
			throw uploadError instanceof Error
				? uploadError
				: new Error("Không thể tải ảnh lên.");
		}
	}

	return {
		...task,
		description: html,
		status: payload.status,
		priority: payload.priority,
		assignees: [],
	};
}

export async function updateTask(
	payload: TaskUpdate & { id: string }
): Promise<Task> {
	const admin = createServiceClient();
	const user = await getLoggedUser();

	if (!user) {
		throw new Error("Bạn cần đăng nhập để cập nhật công việc.");
	}

	const { id, ...fields } = payload;

	const { data, error } = await admin
		.from("tasks")
		.update(fields)
		.eq("id", id)
		.select("*")
		.single();

	if (error) {
		throw new Error(error.message);
	}

	return mapTaskWithAssignees(admin, data);
}

export async function deleteTask(_id: string): Promise<void> {
	// TODO: implement delete
	throw new Error("Not implemented");
}
