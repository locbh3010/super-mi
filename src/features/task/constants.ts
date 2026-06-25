import { TaskPriority, TaskStatus } from "./types";
import type { CreateTaskFormValues } from "./types";

export const KANBAN_COLUMNS: TaskStatus[] = [
	TaskStatus.TODO,
	TaskStatus.IN_PROGRESS,
	TaskStatus.REVIEW,
	TaskStatus.DONE,
];

export const TASK_SORT_FIELD: Record<string, string> = {
	title: "title",
	priority: "priority",
	status: "status",
	createdAt: "created_at",
};

export const STATUS_META: Record<TaskStatus, { label: string; color: string }> =
	{
		[TaskStatus.TODO]: { label: "Cần làm", color: "#94a3b8" },
		[TaskStatus.IN_PROGRESS]: { label: "Đang làm", color: "#3b82f6" },
		[TaskStatus.REVIEW]: { label: "Đang duyệt", color: "#f59e0b" },
		[TaskStatus.DONE]: { label: "Hoàn thành", color: "#22c55e" },
	};

export const PRIORITY_META: Record<
	TaskPriority,
	{ label: string; color: string }
> = {
	[TaskPriority.LOW]: { label: "Thấp", color: "#94a3b8" },
	[TaskPriority.MEDIUM]: { label: "Trung bình", color: "#3b82f6" },
	[TaskPriority.HIGH]: { label: "Cao", color: "#f59e0b" },
	[TaskPriority.URGENT]: { label: "Khẩn cấp", color: "#ef4444" },
};

export const TASK_STATUS_OPTIONS = (
	Object.entries(STATUS_META) as [
		TaskStatus,
		{ label: string; color: string },
	][]
).map(([value, meta]) => ({ value, ...meta }));

export const TASK_PRIORITY_OPTIONS = (
	Object.entries(PRIORITY_META) as [
		TaskPriority,
		{ label: string; color: string },
	][]
).map(([value, meta]) => ({ value, ...meta }));

export const TASK_FORM_DEFAULTS: CreateTaskFormValues = {
	title: "",
	description: "",
	status: TaskStatus.TODO,
	priority: TaskPriority.MEDIUM,
	implementIds: [],
	watcherIds: [],
	dueDate: null,
};
