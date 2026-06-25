"use client";

import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { KANBAN_COLUMNS } from "../constants";
import { kanbanColumnInfiniteOptions } from "../query-options";
import type { Task, TaskStatus } from "../types";

export type KanbanColumnData = {
	status: TaskStatus;
	tasks: Task[];
	total: number;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	isLoading: boolean;
	fetchNextPage: () => void;
};

/**
 * Fetch tasks cho 1 cột kanban (1 status) — infinite load-more độc lập.
 */
export function useKanbanColumn(
	projectId: string,
	status: TaskStatus,
	search?: string
): KanbanColumnData {
	const query = useInfiniteQuery(
		kanbanColumnInfiniteOptions(projectId, status, search)
	);

	const tasks = useMemo(
		() => query.data?.pages.flatMap(p => p.items) ?? [],
		[query.data]
	);

	return {
		status,
		tasks,
		total: query.data?.pages[0]?.total ?? 0,
		hasNextPage: query.hasNextPage,
		isFetchingNextPage: query.isFetchingNextPage,
		isLoading: query.isLoading,
		fetchNextPage: query.fetchNextPage,
	};
}

/**
 * Fetch toàn bộ board: mỗi cột status là 1 infinite query riêng
 * (load-more độc lập). KANBAN_COLUMNS là hằng số → số hook gọi cố định,
 * an toàn với rules-of-hooks.
 */
export function useKanbanTasks(
	projectId: string,
	search?: string
): KanbanColumnData[] {
	/* eslint-disable react-hooks/rules-of-hooks */
	return KANBAN_COLUMNS.map(status =>
		useKanbanColumn(projectId, status, search)
	);
	/* eslint-enable react-hooks/rules-of-hooks */
}
