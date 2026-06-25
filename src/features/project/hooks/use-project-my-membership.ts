"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyProjectMembership } from "../services";
import { PROJECT_MEMBERS_QUERY_KEYS } from "../query-options";

export function useProjectMyMembership(projectId: string) {
	return useQuery({
		queryKey: PROJECT_MEMBERS_QUERY_KEYS.myMembership(projectId),
		queryFn: () => getMyProjectMembership(projectId),
		staleTime: 60 * 1000,
	});
}