import {
	infiniteQueryOptions,
	keepPreviousData,
	queryOptions,
} from "@tanstack/react-query";

import { getMembers, getProjectById, getProjectMembers, getProjects } from "./services";
import type { GetMembersParams, GetProjectMembersParams, GetProjectsParams } from "./types";

/**
 * Query keys tập trung cho feature project.
 * - `all`: base key, dùng để invalidate toàn bộ query liên quan project.
 * - `list`: danh sách dự án theo params (search/page/sort...).
 * - `detail`: chi tiết một dự án theo id.
 */
export const PROJECT_QUERY_KEYS = {
	all: ["projects"] as const,
	lists: () => [...PROJECT_QUERY_KEYS.all, "list"] as const,
	list: (params: GetProjectsParams) =>
		[...PROJECT_QUERY_KEYS.lists(), params] as const,
	details: () => [...PROJECT_QUERY_KEYS.all, "detail"] as const,
	detail: (id: string) => [...PROJECT_QUERY_KEYS.details(), id] as const,
};

/** Query options cho danh sách dự án. */
export function projectsQueryOptions(params: GetProjectsParams = {}) {
	return queryOptions({
		queryKey: PROJECT_QUERY_KEYS.list(params),
		queryFn: () => getProjects(params),
		placeholderData: keepPreviousData,
	});
}

/** Query options cho chi tiết một dự án theo id. */
export function projectByIdQueryOptions(projectId: string) {
	return queryOptions({
		queryKey: PROJECT_QUERY_KEYS.detail(projectId),
		queryFn: () => getProjectById(projectId),
	});
}

/** Số thành viên load mỗi trang khi scroll. */
const MEMBERS_PAGE_SIZE = 20;

/** Query keys cho danh sách thành viên (ô chọn). */
export const MEMBER_QUERY_KEYS = {
	all: ["members"] as const,
	lists: () => [...MEMBER_QUERY_KEYS.all, "list"] as const,
	list: (search: string, projectId?: string | null) =>
		[...MEMBER_QUERY_KEYS.lists(), { search, projectId: projectId ?? null }] as const,
};

/**
 * Infinite query options cho danh sách thành viên.
 * Mỗi page trả về { items, total }; `getNextPageParam` tính trang kế tiếp
 * dựa trên tổng số item đã load so với `total`.
 */
export function membersInfiniteQueryOptions(
	search: string = "",
	projectId?: string | null
) {
	return infiniteQueryOptions({
		queryKey: MEMBER_QUERY_KEYS.list(search, projectId),
		queryFn: ({ pageParam }) =>
			getMembers({
				page: pageParam,
				limit: MEMBERS_PAGE_SIZE,
				search: search || undefined,
				projectId: projectId || undefined,
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			const loaded = allPages.reduce(
				(sum, page) => sum + page.items.length,
				0
			);
			return loaded < lastPage.total ? allPages.length + 1 : undefined;
		},
	});
}

export const membersQueryOptions = (params: GetMembersParams) => {
	return queryOptions({
		queryKey: [...MEMBER_QUERY_KEYS.all, params],
		queryFn: async () => {
			return getMembers(params);
		},
	});
};

/** Query keys cho danh sách thành viên của một dự án (bảng MembersTab). */
export const PROJECT_MEMBERS_QUERY_KEYS = {
	all: ["project-members"] as const,
	lists: (projectId: string) =>
		[...PROJECT_MEMBERS_QUERY_KEYS.all, projectId] as const,
	list: (params: GetProjectMembersParams) =>
		[...PROJECT_MEMBERS_QUERY_KEYS.lists(params.projectId), params] as const,
	/** Membership row của user hiện tại trong project (gate quyền UI). */
	myMembership: (projectId: string) =>
		[...PROJECT_MEMBERS_QUERY_KEYS.lists(projectId), "me"] as const,
};

/** Query options cho danh sách thành viên của một dự án. */
export function projectMembersQueryOptions(params: GetProjectMembersParams) {
	return queryOptions({
		queryKey: PROJECT_MEMBERS_QUERY_KEYS.list(params),
		queryFn: () => getProjectMembers(params),
		placeholderData: keepPreviousData,
	});
}
