"use server";

import { createServiceClient } from "@/configs/supabase-service";
import { fetchList, type QueryFilter } from "@/utils/fetch-list";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ImageBlobMapping } from "@/components/rich-editor/types";

import {
	AttachmentUseFor,
	createAttachment,
	deleteAttachments,
	getAttachments,
} from "../attachment";
import { deleteFolder } from "../attachment/r2";
import { getLoggedUser } from "../auth/services";
import { TaskMemberType, TaskPriority, TaskStatus } from "./types";
import type {
	CreateTaskPayload,
	GetTasksParams,
	Task,
	TaskAssign,
	TaskListResult,
	TaskRow,
	UpdateTaskPayload,
} from "./types";

/** Build R2 path cho ảnh của 1 task: `${user}/project/${projectId}/task/${taskId}`. */
function taskImagePath(userId: string, projectId: string, taskId: string) {
	return `${userId}/${AttachmentUseFor.PROJECT}/${projectId}/${AttachmentUseFor.TASK}/${taskId}`;
}

/**
 * Upload ảnh blob mới trong html lên R2, thay blobUrl -> public URL.
 * Trả về { html, attachmentIds } để caller xử lý rollback / reconcile.
 */
async function uploadTaskImages(
	html: string,
	images: ImageBlobMapping[],
	opts: { userId: string; projectId: string; taskId: string }
): Promise<{ html: string; attachmentIds: number[] }> {
	const used = images.filter(img => html.includes(img.blobUrl));
	const attachmentIds: number[] = [];
	let result = html;

	if (used.length === 0) {
		return { html: result, attachmentIds };
	}

	const path = taskImagePath(opts.userId, opts.projectId, opts.taskId);

	for (const img of used) {
		const attachment = await createAttachment({
			file: img.file,
			useFor: AttachmentUseFor.TASK,
			targetId: opts.taskId,
			uploaderId: opts.userId,
			path,
		});
		attachmentIds.push(attachment.id);
		result = result.replaceAll(img.blobUrl, attachment.url);
	}

	return { html: result, attachmentIds };
}

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

export async function getTaskById(id: string): Promise<Task | null> {
	const supabase = createServiceClient();
	const user = await getLoggedUser();

	if (!user) {
		throw new Error("Bạn cần đăng nhập để xem công việc.");
	}

	const { data, error } = await supabase
		.from("tasks")
		.select("*")
		.eq("id", id)
		.maybeSingle();

	if (error) {
		throw new Error(error.message);
	}

	return data ? mapTaskWithAssignees(supabase, data) : null;
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

/**
 * Cập nhật nhanh status 1 task (dùng cho drag-drop kanban — không đụng members/ảnh).
 */
export async function updateTaskStatus(
	id: string,
	status: TaskStatus
): Promise<Task> {
	const admin = createServiceClient();
	const user = await getLoggedUser();

	if (!user) {
		throw new Error("Bạn cần đăng nhập để cập nhật công việc.");
	}

	const { data, error } = await admin
		.from("tasks")
		.update({ status })
		.eq("id", id)
		.select("*")
		.single();

	if (error) {
		throw new Error(error.message);
	}

	return mapTaskWithAssignees(admin, data);
}

/**
 * Cập nhật task:
 * - Reconcile ảnh trong html: upload ảnh blob mới, xóa attachment cũ không còn dùng.
 * - Update fields tasks.
 * - Reconcile members (diff implement/watcher): xóa member bị bỏ, thêm member mới.
 */
export async function updateTask(payload: UpdateTaskPayload): Promise<Task> {
	const admin = createServiceClient();
	const user = await getLoggedUser();

	if (!user) {
		throw new Error("Bạn cần đăng nhập để cập nhật công việc.");
	}

	const { id, projectId } = payload;
	let html = payload.description ?? "";

	// 1. Upload ảnh blob mới (nếu có) -> thay public URL vào html.
	const { html: uploadedHtml } = await uploadTaskImages(
		html,
		payload.images ?? [],
		{ userId: user.id, projectId, taskId: id }
	);
	html = uploadedHtml;

	// 2. Xóa attachment cũ mà url không còn xuất hiện trong html mới.
	const existingAtts = await getAttachments(id, AttachmentUseFor.TASK);
	const staleIds = existingAtts
		.filter(a => !html.includes(a.url))
		.map(a => a.id);
	if (staleIds.length > 0) {
		await deleteAttachments(staleIds).catch(() => undefined);
	}

	// 3. Update fields tasks.
	const { data, error } = await admin
		.from("tasks")
		.update({
			title: payload.title,
			description: html,
			status: payload.status,
			priority: payload.priority,
			due_at: payload.dueDate,
		})
		.eq("id", id)
		.select("*")
		.single();

	if (error) {
		throw new Error(error.message);
	}

	// 4. Reconcile members (diff theo user_id + type).
	const { data: existingMembers } = await admin
		.from("tasks_members")
		.select("id, user_id, type")
		.eq("task_id", id);

	const desired = [
		...payload.implementIds.map(uid => ({
			user_id: uid,
			type: TaskMemberType.IMPLEMENT,
		})),
		...payload.watcherIds.map(uid => ({
			user_id: uid,
			type: TaskMemberType.WATCHER,
		})),
	];

	const keyOf = (m: { user_id: string; type: string }) =>
		`${m.user_id}:${m.type}`;
	const existingKeys = new Set((existingMembers ?? []).map(keyOf));
	const desiredKeys = new Set(desired.map(keyOf));

	const toRemoveIds = (existingMembers ?? [])
		.filter(m => !desiredKeys.has(keyOf(m)))
		.map(m => m.id);

	const toInsert = desired
		.filter(m => !existingKeys.has(keyOf(m)))
		.map(m => ({ task_id: id, user_id: m.user_id, type: m.type }));

	if (toRemoveIds.length > 0) {
		await admin.from("tasks_members").delete().in("id", toRemoveIds);
	}
	if (toInsert.length > 0) {
		await admin.from("tasks_members").insert(toInsert);
	}

	return mapTaskWithAssignees(admin, data);
}

/**
 * Xóa task: xóa attachments (R2 + DB) + folder R2 + members + task.
 * Mirror cleanup trong deleteProject.
 */
export async function deleteTask(
	id: string,
	projectId: string
): Promise<void> {
	const admin = createServiceClient();
	const user = await getLoggedUser();

	if (!user) {
		throw new Error("Bạn cần đăng nhập để xóa công việc.");
	}

	// 1. Xóa attachments của task (R2 + DB).
	const atts = await getAttachments(id, AttachmentUseFor.TASK);
	if (atts.length > 0) {
		await deleteAttachments(atts.map(a => a.id)).catch(() => undefined);
	}

	// 2. Dọn folder R2 của task (xóa object rác không có record DB).
	await deleteFolder(taskImagePath(user.id, projectId, id)).catch(
		() => undefined
	);

	// 3. Xóa members.
	await admin
		.from("tasks_members")
		.delete()
		.eq("task_id", id)
		.then(({ error }) => {
			if (error) throw new Error(error.message);
		});

	// 4. Xóa task.
	const { error } = await admin.from("tasks").delete().eq("id", id);
	if (error) {
		throw new Error(error.message);
	}
}
