"use client";

import { message, notification } from "@/components/providers/Providers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveProject } from "../services";
import { PROJECT_QUERY_KEYS } from "../query-options";

export function useLeaveProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (projectId: string) => leaveProject(projectId),
		onSuccess: result => {
			message.success(
				result.deleted
					? "Đã rời và xóa dự án thành công!"
					: "Đã rời dự án thành công!"
			);
			queryClient.invalidateQueries({
				queryKey: PROJECT_QUERY_KEYS.all,
			});
		},
		onError: err =>
			notification.error({
				title: "Thất bại",
				description: err.message,
				showProgress: true,
			}),
	});
}
