import {
	keepPreviousData,
	queryOptions,
} from "@tanstack/react-query";

import { getTaskById, getTasks } from "./services";
import type { GetTasksParams } from "./types";

export const TASK_QUERY_KEYS = {
	all: ["tasks"] as const,
	lists: () => [...TASK_QUERY_KEYS.all, "list"] as const,
	list: (params: GetTasksParams) =>
		[...TASK_QUERY_KEYS.lists(), params] as const,
	details: () => [...TASK_QUERY_KEYS.all, "detail"] as const,
	detail: (id: string) => [...TASK_QUERY_KEYS.details(), id] as const,
};

export const tasksQueryOptions = (params: GetTasksParams) =>
	queryOptions({
		queryKey: TASK_QUERY_KEYS.list(params),
		queryFn: () => getTasks(params),
		placeholderData: keepPreviousData,
	});

export const taskByIdQueryOptions = (id: string) =>
	queryOptions({
		queryKey: TASK_QUERY_KEYS.detail(id),
		queryFn: () => getTaskById(id),
		enabled: !!id,
	});
