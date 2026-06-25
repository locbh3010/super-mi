"use client";

import { message } from "@/components/providers/Providers";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateTask } from "../services";
import type { UpdateTaskPayload } from "../types";
import { TASK_QUERY_KEYS } from "../query-options";

/**
 * Sửa task qua drawer. Invalidate list để fetch lại sau khi lưu.
 */
export function useEditTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateTaskPayload) => updateTask(payload),
		onSuccess: () => {
			message.success("Cập nhật công việc thành công!");
			queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
		},
		onError: (error: Error) => {
			message.error(error.message || "Không thể cập nhật công việc.");
		},
	});
}
