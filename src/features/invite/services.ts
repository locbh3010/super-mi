"use server";

import { createServerClient } from "@/configs/supabase-server";
import { createServiceClient } from "@/configs/supabase-service";
import type { TablesInsert } from "@/types/database";
import { fetchList } from "@/utils/fetch-list";
import { getLoggedUser, getProfileByEmail } from "../auth/services";
import {
	addMember,
	checkProjectMemberRole,
	checkProjectMembership,
} from "../project/services";
import { ProjectMemberRole } from "../project/types";
import { InviteStatus, type Invite } from "./types";

export interface SendInvitePayload {
	projectId: string;
	receiveEmail: string;
}

function toInvite(row: Record<string, unknown>): Invite {
	return {
		...row,
		status: (row as { status: string }).status as InviteStatus,
	} as Invite;
}

// ============================================================
// INSERT — dùng SSR client (RLS)
// ============================================================

/**
 * Gửi lời mời tham gia dự án qua email.
 * INSERT qua SSR client (RLS kiểm tra quyền).
 */
export async function sendInvite(payload: SendInvitePayload): Promise<Invite> {
	const user = await getLoggedUser();
	if (!user) {
		throw new Error("Bạn cần đăng nhập để gửi lời mời.");
	}

	// Kiểm tra user có thuộc project và có role manager hoặc owner.
	await checkProjectMemberRole(user.id, payload.projectId, [
		ProjectMemberRole.OWNER,
		ProjectMemberRole.MANAGER,
	]);

	// Kiểm tra email người nhận đã là thành viên của project chưa.
	const receiverProfile = await getProfileByEmail(payload.receiveEmail);

	if (receiverProfile) {
		const existingMember = await checkProjectMembership(
			receiverProfile.id,
			payload.projectId
		);

		if (existingMember) {
			throw new Error("Người này đã là thành viên của dự án.");
		}
	}

	const supabase = await createServerClient();

	// Kiểm tra trùng (SELECT qua RLS)
	const { data: existingInvite } = await supabase
		.from("invitees")
		.select("id")
		.eq("project_id", payload.projectId)
		.eq("receive_email", payload.receiveEmail)
		.eq("status", InviteStatus.PENDING)
		.maybeSingle();

	if (existingInvite) {
		throw new Error("Đã gửi lời mời cho email này và đang chờ phản hồi.");
	}

	const insert: TablesInsert<"invitees"> = {
		project_id: payload.projectId,
		receive_email: payload.receiveEmail,
		sender_id: user.id,
		status: InviteStatus.PENDING,
	};

	const { data, error } = await supabase
		.from("invitees")
		.insert(insert)
		.select("*")
		.single();

	if (error) {
		throw new Error(error.message);
	}

	return toInvite(data);
}

// ============================================================
// FETCH / SELECT — dùng SSR client
// ============================================================

/**
 * Lấy danh sách invitees theo project.
 */
export async function getInvitees(projectId: string): Promise<Invite[]> {
	const supabase = await createServerClient();

	const { data, error } = await fetchList<Invite>(supabase, "invitees", {
		select: "*",
		isAll: true,
		filters: [{ key: "project_id", operator: "equal", value: projectId }],
		orders: { created_at: true } as any,
	});

	if (error) {
		throw new Error(error.message);
	}

	return (data ?? []).map(toInvite);
}

/**
 * Fetch danh sách lời mời đã gửi (sender = current user), chỉ PENDING.
 */
export async function fetchSendInviteesRequest(): Promise<Invite[]> {
	const user = await getLoggedUser();
	if (!user) {
		throw new Error("Bạn cần đăng nhập.");
	}

	const supabase = await createServerClient();

	const { data, error } = await fetchList<Invite>(supabase, "invitees", {
		select: "*",
		isAll: true,
		filters: [
			{ key: "sender_id", operator: "equal", value: user.id },
			{ key: "status", operator: "equal", value: InviteStatus.PENDING },
		],
		orders: { created_at: true } as any,
	});

	if (error) {
		throw new Error(error.message);
	}

	return (data ?? []).map(toInvite);
}

/**
 * Fetch danh sách lời mời nhận được (receive_email = current user email), chỉ PENDING.
 */
export async function fetchReceiveInviteesRequest(): Promise<Invite[]> {
	const user = await getLoggedUser();
	if (!user) {
		throw new Error("Bạn cần đăng nhập.");
	}

	const supabase = createServiceClient();

	const { data, error } = await fetchList<Invite>(supabase, "invitees", {
		select: "*, project:projects(*), sender:profiles!invitees_sender_id_fkey(*)",
		isAll: true,
		filters: [
			{ key: "receive_email", operator: "equal", value: user.email },
			{ key: "status", operator: "equal", value: InviteStatus.PENDING },
		],
		orders: { created_at: true } as any,
	});

	if (error) {
		throw new Error(error.message);
	}

	return (data ?? []).map(toInvite);
}

// ============================================================
// UPDATE / DELETE — dùng SSR client
// Auth check thủ công.
// ============================================================

/**
 * Chấp nhận lời mời: PENDING -> ACCEPTED.
 * Chỉ receiver mới có quyền.
 */
export async function acceptInvite(inviteId: string): Promise<Invite> {
	const user = await getLoggedUser();
	if (!user) {
		throw new Error("Bạn cần đăng nhập.");
	}

	const supabase = createServiceClient();

	const { data: invite, error: findError } = await supabase
		.from("invitees")
		.select("*")
		.eq("id", inviteId)
		.maybeSingle();

	if (findError) {
		throw new Error(findError.message);
	}

	if (!invite) {
		throw new Error("Không tìm thấy lời mời.");
	}

	if (invite.receive_email !== user.email) {
		throw new Error("Bạn không có quyền chấp nhận lời mời này.");
	}

	if (invite.status !== InviteStatus.PENDING) {
		throw new Error("Lời mời này không còn ở trạng thái chờ xử lý.");
	}

	const { data, error } = await supabase
		.from("invitees")
		.update({ status: InviteStatus.ACCEPTED })
		.eq("id", inviteId)
		.select("*")
		.single();

	if (error) {
		throw new Error(error.message);
	}

	await addMember(invite.project_id, user.id, ProjectMemberRole.MEMBER);

	return toInvite(data);
}

/**
 * Từ chối lời mời: PENDING -> DECLINED.
 * Chỉ receiver mới có quyền.
 */
export async function rejectInvite(inviteId: string): Promise<Invite> {
	const user = await getLoggedUser();
	if (!user) {
		throw new Error("Bạn cần đăng nhập.");
	}

	const supabase = await createServerClient();

	const { data: invite, error: findError } = await supabase
		.from("invitees")
		.select("*")
		.eq("id", inviteId)
		.maybeSingle();

	if (findError) {
		throw new Error(findError.message);
	}

	if (!invite) {
		throw new Error("Không tìm thấy lời mời.");
	}

	if (invite.receive_email !== user.email) {
		throw new Error("Bạn không có quyền từ chối lời mời này.");
	}

	if (invite.status !== InviteStatus.PENDING) {
		throw new Error("Lời mời này không còn ở trạng thái chờ xử lý.");
	}

	const { data, error } = await supabase
		.from("invitees")
		.update({ status: InviteStatus.DECLINED })
		.eq("id", inviteId)
		.select("*")
		.single();

	if (error) {
		throw new Error(error.message);
	}

	return toInvite(data);
}

/**
 * Hủy lời mời đã gửi: xoá bản ghi.
 * Chỉ sender mới có quyền, và chỉ khi PENDING.
 */
export async function cancelInvite(inviteId: string): Promise<{ id: string }> {
	const user = await getLoggedUser();
	if (!user) {
		throw new Error("Bạn cần đăng nhập.");
	}

	const supabase = createServiceClient();

	const { data: invite, error: findError } = await supabase
		.from("invitees")
		.select("*")
		.eq("id", inviteId)
		.maybeSingle();

	if (findError) {
		throw new Error(findError.message);
	}

	if (!invite) {
		throw new Error("Không tìm thấy lời mời.");
	}

	if (invite.sender_id !== user.id) {
		throw new Error("Bạn không có quyền hủy lời mời này.");
	}

	if (invite.status !== InviteStatus.PENDING) {
		throw new Error("Chỉ có thể hủy lời mời đang ở trạng thái chờ xử lý.");
	}

	const { error } = await supabase
		.from("invitees")
		.delete()
		.eq("id", inviteId);

	if (error) {
		throw new Error(error.message);
	}

	return { id: inviteId };
}
