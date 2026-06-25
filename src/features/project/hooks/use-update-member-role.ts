"use client";

import { message, notification } from "@/components/providers/Providers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMemberRole } from "../services";
import { ProjectMemberRole } from "../types";
import {
	PROJECT_MEMBERS_QUERY_KEYS,
	PROJECT_QUERY_KEYS,
} from "../query-options";

type UpdateMemberRolePayload = {
	memberId: string;
	role: ProjectMemberRole;
};

export function useUpdateMemberRole(projectId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateMemberRolePayload) =>
			updateMemberRole(payload.memberId, projectId, payload.role),
		onSuccess: () => {
			message.success("Đã cập nhật vai trò!");
			queryClient.invalidateQueries({
				queryKey: PROJECT_MEMBERS_QUERY_KEYS.lists(projectId),
			});
			queryClient.invalidateQueries({
				queryKey: PROJECT_QUERY_KEYS.all,
			});
		},
		onError: err =>
			notification.error({
				title: "Không thể đổi vai trò",
				description: err.message,
				showProgress: true,
			}),
	});
}