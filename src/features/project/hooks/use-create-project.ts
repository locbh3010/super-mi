"use client";

import { message } from "@/components/providers/Providers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject } from "../services";
import type { CreateProjectPayload } from "../types";
import { PROJECT_QUERY_KEYS } from "../query-options";

export function useCreateProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateProjectPayload) => createProject(input),
		onSuccess: () => {
			message.success("Tạo dự án thành công!");
			queryClient.invalidateQueries({
				queryKey: PROJECT_QUERY_KEYS.all,
			});
		},
	});
}
