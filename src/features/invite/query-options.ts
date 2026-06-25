import { queryOptions } from "@tanstack/react-query";

import {
	fetchReceiveInviteesRequest,
	fetchSendInviteesRequest,
	getInvitees,
} from "./services";

export const INVITE_QUERY_KEYS = {
	all: ["invites"] as const,
	send: () => [...INVITE_QUERY_KEYS.all, "send"] as const,
	receive: () => [...INVITE_QUERY_KEYS.all, "receive"] as const,
	byProject: (projectId: string) =>
		[...INVITE_QUERY_KEYS.all, "project", projectId] as const,
};

/** Query options cho danh sách lời mời đã gửi (PENDING). */
export function sendInviteesQueryOptions() {
	return queryOptions({
		queryKey: INVITE_QUERY_KEYS.send(),
		queryFn: () => fetchSendInviteesRequest(),
	});
}

/** Query options cho danh sách lời mời nhận được (PENDING). */
export function receiveInviteesQueryOptions() {
	return queryOptions({
		queryKey: INVITE_QUERY_KEYS.receive(),
		queryFn: () => fetchReceiveInviteesRequest(),
	});
}

/** Query options cho danh sách invitees theo project. */
export function inviteesByProjectQueryOptions(projectId: string) {
	return queryOptions({
		queryKey: INVITE_QUERY_KEYS.byProject(projectId),
		queryFn: () => getInvitees(projectId),
		enabled: !!projectId,
	});
}