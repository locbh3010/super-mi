"use server";

import { createServiceClient } from "@/configs/supabase-service";

import {
	AttachmentUseFor,
	createAttachment,
	deleteAttachments,
} from "../attachment";
import { getLoggedUser } from "../auth/services";
import { TaskMemberType } from "./types";
import type {
	CreateTaskPayload,
	GetTasksParams,
	Task,
	TaskListResult,
	TaskUpdate,
} from "./types";

export async function getTasks(
	_params: GetTasksParams
): Promise<TaskListResult> {
	// TODO: implement paginated query with filters
	return { items: [], total: 0 };
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
	_payload: TaskUpdate & { id: string }
): Promise<Task> {
	// TODO: implement update
	throw new Error("Not implemented");
}

export async function deleteTask(_id: string): Promise<void> {
	// TODO: implement delete
	throw new Error("Not implemented");
}
