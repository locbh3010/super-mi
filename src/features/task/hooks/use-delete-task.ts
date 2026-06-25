"use client";

import { message } from "@/components/providers/Providers";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteTask } from "../services";
import { TASK_QUERY_KEYS } from "../query-options";

/**
 * Xóa task (kèm attachments + members). Invalidate list sau khi xóa.
 */
export function useDeleteTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: { id: string; projectId: string }) =>
			deleteTask(payload.id, payload.projectId),
		onSuccess: () => {
			message.success("Đã xóa công việc.");
			queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
		},
		onError: (error: Error) => {
			message.error(error.message || "Không thể xóa công việc.");
		},
	});
}
