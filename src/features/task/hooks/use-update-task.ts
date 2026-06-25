"use client";

import { message } from "@/components/providers/Providers";
import { useMutation } from "@tanstack/react-query";

import { updateTask } from "../services";
import type { TaskUpdate } from "../types";

/**
 * Cập nhật task. KHÔNG auto-invalidate query list — vì kanban xử lý optimistic
 * ở local; invalidate sẽ refetch gây giật danh sách dnd. Caller tự rollback khi lỗi.
 */
export function useUpdateTask() {
	return useMutation({
		mutationFn: (payload: TaskUpdate & { id: string }) =>
			updateTask(payload),
		onError: (error: Error) => {
			message.error(error.message || "Không thể cập nhật công việc.");
		},
	});
}
