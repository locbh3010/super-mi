"use client";

import { message, notification } from "@/components/providers/Providers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeMember } from "../services";
import {
	PROJECT_MEMBERS_QUERY_KEYS,
	PROJECT_QUERY_KEYS,
} from "../query-options";

export function useRemoveMember(projectId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (memberId: string) => removeMember(memberId, projectId),
		onSuccess: () => {
			message.success("Đã xóa thành viên khỏi dự án!");
			queryClient.invalidateQueries({
				queryKey: PROJECT_MEMBERS_QUERY_KEYS.lists(projectId),
			});
			queryClient.invalidateQueries({
				queryKey: PROJECT_QUERY_KEYS.all,
			});
		},
		onError: err =>
			notification.error({
				title: "Không thể xóa thành viên",
				description: err.message,
				showProgress: true,
			}),
	});
}