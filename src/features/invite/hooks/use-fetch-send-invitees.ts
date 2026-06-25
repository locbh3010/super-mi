"use client";

import { useQuery } from "@tanstack/react-query";
import { sendInviteesQueryOptions } from "../query-options";

export function useFetchSendInvitees() {
	return useQuery(sendInviteesQueryOptions());
}