import {
	infiniteQueryOptions,
	keepPreviousData,
	queryOptions,
} from "@tanstack/react-query";

import { getTaskById, getTasks } from "./services";
import type { GetTasksParams, TaskStatus } from "./types";

export const TASK_QUERY_KEYS = {
	all: ["tasks"] as const,
	lists: () => [...TASK_QUERY_KEYS.all, "list"] as const,
	list: (params: GetTasksParams) =>
		[...TASK_QUERY_KEYS.lists(), params] as const,
	kanbanColumns: (projectId: string) =>
		[...TASK_QUERY_KEYS.all, "kanban", projectId] as const,
	kanbanColumn: (projectId: string, status: TaskStatus, search?: string) =>
		[
			...TASK_QUERY_KEYS.kanbanColumns(projectId),
			status,
			search ?? "",
		] as const,
	details: () => [...TASK_QUERY_KEYS.all, "detail"] as const,
	detail: (id: string) => [...TASK_QUERY_KEYS.details(), id] as const,
};

/** Số task tải mỗi lần (mỗi cột kanban / mỗi trang bảng). */
export const TASKS_PAGE_SIZE = 20;

export const tasksQueryOptions = (params: GetTasksParams) =>
	queryOptions({
		queryKey: TASK_QUERY_KEYS.list(params),
		queryFn: () => getTasks(params),
		placeholderData: keepPreviousData,
	});

/**
 * Infinite query cho 1 cột kanban (1 status). Phân trang theo cột:
 * mỗi cột load-more độc lập, tránh tình trạng 1 status nuốt hết page chung.
 */
export const kanbanColumnInfiniteOptions = (
	projectId: string,
	status: TaskStatus,
	search?: string
) =>
	infiniteQueryOptions({
		queryKey: TASK_QUERY_KEYS.kanbanColumn(projectId, status, search),
		queryFn: ({ pageParam }) =>
			getTasks({
				projectId,
				status,
				search,
				page: pageParam,
				limit: TASKS_PAGE_SIZE,
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			const loaded = allPages.reduce((sum, p) => sum + p.items.length, 0);
			return loaded < lastPage.total ? allPages.length + 1 : undefined;
		},
	});

export const taskByIdQueryOptions = (id: string) =>
	queryOptions({
		queryKey: TASK_QUERY_KEYS.detail(id),
		queryFn: () => getTaskById(id),
		enabled: !!id,
	});
