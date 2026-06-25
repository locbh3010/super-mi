"use client";

import { useQuery } from "@tanstack/react-query";
import { receiveInviteesQueryOptions } from "../query-options";

export function useFetchReceiveInvitees() {
	return useQuery(receiveInviteesQueryOptions());
}