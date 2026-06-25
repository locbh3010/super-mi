"use client";

import { message } from "@/components/providers/Providers";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTask } from "../services";
import type { CreateTaskPayload } from "../types";
import { TASK_QUERY_KEYS } from "../query-options";

export function useCreateTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateTaskPayload) => createTask(input),
		onSuccess: () => {
			message.success("Tạo công việc thành công!");
			queryClient.invalidateQueries({
				queryKey: TASK_QUERY_KEYS.all,
			});
		},
		onError: (error: Error) => {
			message.error(error.message || "Không thể tạo công việc.");
		},
	});
}
