"use client";

import { message } from "@/components/providers/Providers";
import { useMutation } from "@tanstack/react-query";

import { updateTaskStatus } from "../services";
import type { TaskStatus } from "../types";

/**
 * Đổi status task (drag-drop kanban). KHÔNG auto-invalidate — kanban optimistic
 * ở local; invalidate sẽ refetch gây giật. Caller tự rollback khi lỗi.
 */
export function useUpdateTask() {
	return useMutation({
		mutationFn: (payload: { id: string; status: TaskStatus }) =>
			updateTaskStatus(payload.id, payload.status),
		onError: (error: Error) => {
			message.error(error.message || "Không thể cập nhật công việc.");
		},
	});
}
