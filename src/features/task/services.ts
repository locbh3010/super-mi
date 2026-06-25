"use server";

import type { GetTasksParams, Task, TaskInsert, TaskListResult, TaskUpdate } from "./types";

export async function getTasks(
	_params: GetTasksParams
): Promise<TaskListResult> {
	// TODO: implement paginated query with filters
	return { items: [], total: 0 };
}

export async function getTaskById(_id: string): Promise<Task | null> {
	// TODO: implement single task query
	return null;
}

export async function createTask(_payload: TaskInsert): Promise<Task> {
	// TODO: implement create
	throw new Error("Not implemented");
}

export async function updateTask(_payload: TaskUpdate & { id: string }): Promise<Task> {
	// TODO: implement update
	throw new Error("Not implemented");
}

export async function deleteTask(_id: string): Promise<void> {
	// TODO: implement delete
	throw new Error("Not implemented");
}
