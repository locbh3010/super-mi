"use client";

import { message } from "@/components/providers/Providers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { INVITE_QUERY_KEYS } from "../query-options";
import { rejectInvite } from "../services";

export function useRejectInvite() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (inviteId: string) => rejectInvite(inviteId),
		onSuccess: () => {
			message.success("Đã từ chối lời mời!");
			queryClient.invalidateQueries({
				queryKey: INVITE_QUERY_KEYS.all,
			});
		},
	});
}