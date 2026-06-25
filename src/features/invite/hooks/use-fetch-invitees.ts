"use client";

import { useQuery } from "@tanstack/react-query";
import { inviteesByProjectQueryOptions } from "../query-options";

export function useFetchInvitees(projectId: string) {
	return useQuery(inviteesByProjectQueryOptions(projectId));
}