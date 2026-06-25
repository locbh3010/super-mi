import { ProjectMemberRole } from "./types";

export const PROJECTS_SORT_FIELD: Record<string, string> = {
	name: "name",
	progress: "progress",
	createdAt: "created_at",
};

export const ROLE_META: Record<
	ProjectMemberRole,
	{ label: string; color: string }
> = {
	[ProjectMemberRole.OWNER]: { label: "Chủ sở hữu", color: "gold" },
	[ProjectMemberRole.MANAGER]: { label: "Quản lý", color: "blue" },
	[ProjectMemberRole.MEMBER]: { label: "Thành viên", color: "default" },
};
