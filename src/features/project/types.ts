import { Tables } from "@/types/database";

export type Project = Tables<"projects">;

export type ProjectMember = Tables<"projects_members">;

export enum ProjectMemberRole {
	OWNER = "owner",
	MEMBER = "member",
	MANAGER = "manager",
}

/** Tham số truy vấn danh sách dự án. */
export interface GetProjectsParams {
	/** Trang hiện tại (1-based). */
	page?: number;
	/** Số bản ghi mỗi trang. */
	limit?: number;
	/** Từ khóa tìm kiếm theo tên dự án. */
	search?: string;
	/** Sắp xếp theo field + chiều. */
	sort?: { field: string; desc: boolean } | null;
	/** Lọc theo danh sách user_id thành viên. */
	memberIds?: string[];
}

export interface CreateProjectPayload {
	/** Tên dự án. */
	name: string;
	/** Mô tả dự án (tùy chọn). */
	description?: string;
	/** Ảnh đại diện dự án (tùy chọn). */
	thumbnailFile?: File;
}

/** Nhóm thành viên kèm tổng số (dùng cho avatar group). */
export interface ProjectMembersResult {
	items: (ProjectMember & { user: Tables<"profiles"> })[];
	total: number;
}

/** Project kèm danh sách thành viên theo vai trò (model cho bảng danh sách). */
export type ProjectWithMembers = Project & {
	members: ProjectMembersResult;
};

/** Kết quả phân trang danh sách dự án. */
export interface ProjectListResult {
	items: ProjectWithMembers[];
	total: number;
}

/** Hồ sơ người dùng (dùng cho ô chọn thành viên). */
export type Profile = Tables<"profiles">;

/** Tham số truy vấn danh sách thành viên (profiles). */
export interface GetMembersParams {
	/** Trang hiện tại (1-based). */
	page?: number;
	/** Số bản ghi mỗi trang. */
	limit?: number;
	/** Từ khóa tìm kiếm theo tên/email. */
	search?: string;

	projectId?: string | null;
}

/** Kết quả phân trang danh sách thành viên. */
export interface MembersListResult {
	items: Profile[];
	total: number;
}

/** Tham số truy vấn danh sách thành viên của một dự án (bảng MembersTab). */
export interface GetProjectMembersParams {
	projectId: string;
	/** Trang hiện tại (1-based). */
	page?: number;
	/** Số bản ghi mỗi trang. */
	limit?: number;
	/** Từ khóa tìm kiếm theo tên/email. */
	search?: string;
}
