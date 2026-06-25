import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";
import type { ImageBlobMapping } from "@/components/rich-editor/types";

export enum TaskStatus {
	TODO = "todo",
	IN_PROGRESS = "in_progress",
	REVIEW = "review",
	DONE = "done",
}

export enum TaskPriority {
	LOW = "low",
	MEDIUM = "medium",
	HIGH = "high",
	URGENT = "urgent",
}

export enum TaskMemberType {
	IMPLEMENT = "implement",
	WATCHER = "watcher",
}

/** Dòng dữ liệu thô từ bảng tasks (Supabase). */
export type TaskRow = Tables<"tasks">;

/** Payload insert vào bảng tasks. */
export type TaskInsert = TablesInsert<"tasks">;

/** Payload update bảng tasks. */
export type TaskUpdate = TablesUpdate<"tasks">;

export type TaskAssign = Tables<"tasks_members"> & Tables<"profiles">;

export type Task = Omit<TaskRow, "status" | "priority"> & {
	status: TaskStatus;
	priority: TaskPriority;
	assignees: TaskAssign[];
};

/** Payload form tạo/cập nhật công việc. */
export interface CreateTaskFormValues {
	title: string;
	description?: string;
	status: TaskStatus;
	priority: TaskPriority;
	implementIds: string[];
	watcherIds: string[];
	dueDate: string | null;
}

/** Payload gửi xuống server action tạo task (kèm ảnh rich editor cần upload). */
export interface CreateTaskPayload extends CreateTaskFormValues {
	projectId: string;
	/** Ảnh chèn trong editor (blob URL + File) cần upload lên R2 rồi thay vào html. */
	images?: ImageBlobMapping[];
}

/** Tham số truy vấn danh sách công việc. */
export interface GetTasksParams {
	projectId: string;
	page?: number;
	limit?: number;
	search?: string;
	status?: TaskStatus | TaskStatus[];
	priority?: TaskPriority | TaskPriority[];
}

/** Kết quả phân trang danh sách công việc. */
export interface TaskListResult {
	items: Task[];
	total: number;
}
