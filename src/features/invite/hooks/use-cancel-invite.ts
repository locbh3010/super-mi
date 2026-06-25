"use client";

import { message } from "@/components/providers/Providers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { INVITE_QUERY_KEYS } from "../query-options";
import { cancelInvite } from "../services";

export function useCancelInvite() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (inviteId: string) => cancelInvite(inviteId),
		onSuccess: () => {
			message.success("Đã hủy lời mời!");
			queryClient.invalidateQueries({
				queryKey: INVITE_QUERY_KEYS.all,
			});
		},
	});
}
