"use client";

import { useQuery } from "@tanstack/react-query";
import { projectByIdQueryOptions } from "../query-options";

export function useFetchProjectById(projectId: string) {
	const { data: project } = useQuery({
		...projectByIdQueryOptions(projectId),
		enabled: !!projectId,
	});

	return { project };
}
