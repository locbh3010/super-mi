"use client";

import { message } from "@/components/providers/Providers";
import {
	MEMBER_QUERY_KEYS,
	PROJECT_QUERY_KEYS,
} from "@/features/project/query-options";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { INVITE_QUERY_KEYS } from "../query-options";
import { acceptInvite } from "../services";

export function useAcceptInvite() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (inviteId: string) => acceptInvite(inviteId),
		onSuccess: () => {
			message.success("Đã chấp nhận lời mời!");
			queryClient.invalidateQueries({
				queryKey: INVITE_QUERY_KEYS.all,
			});
			queryClient.invalidateQueries({
				queryKey: MEMBER_QUERY_KEYS.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: PROJECT_QUERY_KEYS.lists(),
			});
		},
	});
}
