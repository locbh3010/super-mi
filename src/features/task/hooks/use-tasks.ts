"use client";

import { useQuery } from "@tanstack/react-query";

import { tasksQueryOptions } from "../query-options";
import type { GetTasksParams } from "../types";

/** Fetch list task dạng bảng (phân trang thường). */
export function useTasks(params: GetTasksParams) {
	return useQuery(tasksQueryOptions(params));
}
