"use client";

import { message } from "@/components/providers/Providers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProject } from "../services";
import { PROJECT_QUERY_KEYS } from "../query-options";

export function useDeleteProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (projectId: string) => deleteProject(projectId),
		onSuccess: () => {
			message.success("Xóa dự án thành công!");
			queryClient.invalidateQueries({
				queryKey: PROJECT_QUERY_KEYS.all,
			});
		},
	});
}