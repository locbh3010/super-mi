"use client";

import { message } from "@/components/providers/Providers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { INVITE_QUERY_KEYS } from "../query-options";
import { sendInvite, type SendInvitePayload } from "../services";

export function useSendInvite() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: SendInvitePayload) => sendInvite(payload),
		onSuccess: () => {
			message.success("Đã gửi lời mời!");
			queryClient.invalidateQueries({
				queryKey: INVITE_QUERY_KEYS.all,
			});
		},
	});
}