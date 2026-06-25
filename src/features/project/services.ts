"use server";

import type { TablesInsert } from "@/types/database";
import { createServiceClient } from "@/configs/supabase-service";
import { fetchList } from "@/utils/fetch-list";
import { trim } from "lodash-es";
import {
	AttachmentUseFor,
	buildPath,
	createAttachment,
	deleteAttachment,
	deleteAttachments,
	getAttachments,
} from "../attachment";
import { deleteFolder } from "../attachment/r2";
import { getLoggedUser } from "../auth/services";
import { PROJECTS_SORT_FIELD } from "./constants";
import {
	ProjectMemberRole,
	type CreateProjectPayload,
	type GetMembersParams,
	type GetProjectMembersParams,
	type GetProjectsParams,
	type MembersListResult,
	type Profile,
	type Project,
	type ProjectListResult,
	type ProjectMember,
	type ProjectMembersResult,
} from "./types";

/**
 * Tạo dự án mới:
 * - Tạo record `projects`
 * - Thêm người tạo vào `projects_members` với role chủ sở hữu
 * - Nếu có `thumbnailFile`: upload lên R2 (attachment) rồi cập nhật `thumbnail_url`
 */
export async function createProject(
	payload: CreateProjectPayload
): Promise<Project> {
	const admin = createServiceClient();
	const user = await getLoggedUser();

	if (!user) {
		throw new Error("Bạn cần đăng nhập để tạo dự án.");
	}

	const insert: TablesInsert<"projects"> = {
		name: trim(payload.name),
		description: trim(payload.description) ?? null,
		created_by: user.id,
	};

	const { data: project, error } = await admin
		.from("projects")
		.insert(insert)
		.select("*")
		.single();

	if (error) {
		throw new Error(error.message);
	}

	// Thêm người tạo làm chủ sở hữu.
	const { error: memberError } = await admin.from("projects_members").insert({
		project_id: project.id,
		user_id: user.id,
		role: ProjectMemberRole.OWNER,
	});

	if (memberError) {
		// Rollback project nếu thêm member thất bại.
		await admin.from("projects").delete().eq("id", project.id);
		throw new Error(memberError.message);
	}

	// Upload thumbnail (nếu có) rồi cập nhật url.
	if (payload.thumbnailFile) {
		const attachment = await createAttachment({
			file: payload.thumbnailFile,
			useFor: AttachmentUseFor.PROJECT,
			targetId: project.id,
			uploaderId: user.id,
			onError: async () => {
				// Rollback member + project nếu upload attachment thất bại.
				await admin
					.from("projects_members")
					.delete()
					.eq("project_id", project.id);
				await admin.from("projects").delete().eq("id", project.id);
			},
		});

		const { data: updated, error: updateError } = await admin
			.from("projects")
			.update({ thumbnail_url: attachment.url })
			.eq("id", project.id)
			.select("*")
			.single();

		if (updateError) {
			// Rollback attachment (DB + R2) nếu update thumbnail thất bại.
			await deleteAttachment(attachment.id).catch(() => undefined);
			throw new Error(updateError.message);
		}

		return updated;
	}

	return project;
}

/**
 * Lấy danh sách dự án mà user hiện tại là thành viên:
 * - Hỗ trợ search theo tên, phân trang, sắp xếp.
 * - Kèm danh sách thành viên gom theo vai trò (chủ sở hữu/quản lý/thành viên).
 */
/** Số thành viên hiển thị tối đa trên mỗi dòng dự án. */
const MEMBERS_PREVIEW_LIMIT = 5;

export async function getProjects(
	params: GetProjectsParams = {}
): Promise<ProjectListResult> {
	const { page = 1, limit = 10, search, sort, memberIds } = params;
	const supabase = createServiceClient();
	const user = await getLoggedUser();

	if (!user) {
		throw new Error("Bạn cần đăng nhập để xem danh sách dự án.");
	}

	// Lấy danh sách project_id mà user hiện tại là thành viên.
	const { data: myMemberships, error: membershipError } = await supabase
		.from("projects_members")
		.select("project_id")
		.eq("user_id", user.id);

	if (membershipError) {
		throw new Error(membershipError.message);
	}

	let projectIdFilter = (myMemberships ?? []).map(row => row.project_id);

	// Không tham gia dự án nào → trả về rỗng sớm.
	if (projectIdFilter.length === 0) {
		return { items: [], total: 0 };
	}

	// Nếu lọc thêm theo thành viên: giao với danh sách project của user hiện tại.
	if (memberIds && memberIds.length > 0) {
		const { data: rows, error: filterError } = await supabase
			.from("projects_members")
			.select("project_id")
			.in("user_id", memberIds);

		if (filterError) {
			throw new Error(filterError.message);
		}

		const memberProjectIds = new Set(
			(rows ?? []).map(row => row.project_id)
		);
		projectIdFilter = projectIdFilter.filter(id =>
			memberProjectIds.has(id)
		);

		if (projectIdFilter.length === 0) {
			return { items: [], total: 0 };
		}
	}

	const { data, count, error } = await fetchList<Project>(
		supabase,
		"projects",
		{
			page,
			limit,
			search,
			searchField: ["name"],
			orders:
				sort?.field && PROJECTS_SORT_FIELD[sort?.field]
					? { [PROJECTS_SORT_FIELD[sort?.field]]: sort.desc }
					: { created_at: true },
			filters: [{ key: "id", operator: "in", value: projectIdFilter }],
		}
	);

	if (error) {
		throw new Error(error.message ?? "Không thể tải danh sách dự án.");
	}

	const projects = data ?? [];

	// Gắn preview thành viên (tối đa MEMBERS_PREVIEW_LIMIT) cho từng project.
	const items = await Promise.all(
		projects.map(async project => {
			const { data: members, count: memberCount } = await supabase
				.from("projects_members")
				.select("*, user:profiles!projects_members_user_id_fkey(*)", {
					count: "exact",
				})
				.eq("project_id", project.id)
				.range(0, MEMBERS_PREVIEW_LIMIT - 1);

			const membersResult: ProjectMembersResult = {
				items: (members ?? []) as ProjectMembersResult["items"],
				total: memberCount ?? 0,
			};

			return { ...project, members: membersResult };
		})
	);

	return { items, total: count ?? 0 };
}

/**
 * Lấy danh sách thành viên (profiles) cho ô chọn:
 * - Hỗ trợ search theo display_name/email, phân trang để scroll loadmore.
 */
export async function getMembers(
	params: GetMembersParams = {}
): Promise<MembersListResult> {
	const { page = 1, limit = 20, search, projectId } = params;

	const supabase = createServiceClient();

	const user = await getLoggedUser();

	if (!user) {
		throw new Error("Bạn cần đăng nhập để xem danh sách thành viên.");
	}

	let memberIds: string[];

	if (projectId) {
		// Lọc theo project cụ thể: chỉ lấy user_id trong project đó.
		const { data: projectMembers, error: pmError } = await supabase
			.from("projects_members")
			.select("user_id")
			.eq("project_id", projectId);

		if (pmError) {
			throw new Error(pmError.message);
		}

		memberIds = Array.from(
			new Set((projectMembers ?? []).map(row => row.user_id))
		);
	} else {
		// Logic hiện tại: lấy tất cả user chung dự án với user hiện tại.

		// 1. Các dự án mà user hiện tại tham gia.
		const { data: myProjects, error: myProjectsError } = await supabase
			.from("projects_members")
			.select("project_id")
			.eq("user_id", user.id);

		if (myProjectsError) {
			throw new Error(myProjectsError.message);
		}

		const projectIds = (myProjects ?? []).map(row => row.project_id);

		if (projectIds.length === 0) {
			return { items: [], total: 0 };
		}

		// 2. Tập user_id chung dự án với user hiện tại (loại trùng).
		const { data: relatedMembers, error: relatedError } = await supabase
			.from("projects_members")
			.select("user_id")
			.in("project_id", projectIds);

		if (relatedError) {
			throw new Error(relatedError.message);
		}

		memberIds = Array.from(
			new Set((relatedMembers ?? []).map(row => row.user_id))
		);
	}

	if (memberIds.length === 0) {
		return { items: [], total: 0 };
	}

	// 3. Lấy profiles của tập user đó, có search + phân trang.
	const { data, count, error } = await fetchList<Profile>(
		supabase,
		"profiles",
		{
			page,
			limit,
			search,
			searchField: ["display_name", "email"],
			orders: { display_name: false },
			filters: [{ key: "id", operator: "in", value: memberIds }],
		}
	);

	if (error) {
		throw new Error(error.message ?? "Không thể tải danh sách thành viên.");
	}

	return { items: data ?? [], total: count ?? 0 };
}

/**
 * Lấy danh sách thành viên của một dự án (kèm thông tin profile):
 * - Join projects_members + profiles.
 * - Hỗ trợ search theo tên/email, phân trang.
 */
export async function getProjectMembers(
	params: GetProjectMembersParams
): Promise<ProjectMembersResult> {
	const { projectId, page = 1, limit = 10, search } = params;

	const supabase = createServiceClient();

	const user = await getLoggedUser();

	if (!user) {
		throw new Error("Bạn cần đăng nhập để xem danh sách thành viên.");
	}

	// Kiểm tra user có quyền xem project này không.
	const membership = await checkProjectMembership(user.id, projectId);
	if (!membership) {
		throw new Error("Bạn không có quyền xem dự án này.");
	}

	let query = supabase
		.from("projects_members")
		.select("*, user:profiles!projects_members_user_id_fkey(*)", {
			count: "exact",
		})
		.eq("project_id", projectId);

	// Nếu có search: tìm profile IDs khớp trước, rồi lọc projects_members.
	if (search) {
		const { data: matchedProfiles, error: profileError } = await supabase
			.from("profiles")
			.select("id")
			.or(`display_name.ilike.*${search}*,email.ilike.*${search}*`);

		if (profileError) {
			throw new Error(profileError.message);
		}

		const matchedIds = (matchedProfiles ?? []).map(p => p.id);

		if (matchedIds.length === 0) {
			return { items: [], total: 0 };
		}

		query = query.in("user_id", matchedIds);
	}

	const from = (page - 1) * limit;
	const to = from + limit - 1;

	const { data, count, error } = await query
		.order("created_at", { ascending: true })
		.range(from, to);

	if (error) {
		throw new Error(
			error.message ?? "Không thể tải danh sách thành viên dự án."
		);
	}

	return {
		items: (data ?? []) as ProjectMembersResult["items"],
		total: count ?? 0,
	};
}

/**
 * Thêm thành viên vào dự án qua service client.
 * Mặc định role = MEMBER.
 */
export async function addMember(
	projectId: string,
	userId: string,
	role: ProjectMemberRole = ProjectMemberRole.MEMBER
): Promise<ProjectMember> {
	const admin = createServiceClient();

	// Kiểm tra trùng lặp.
	const existing = await checkProjectMembership(userId, projectId);
	if (existing) {
		throw new Error("Người dùng đã là thành viên của dự án.");
	}

	const { data, error } = await admin
		.from("projects_members")
		.insert({ project_id: projectId, user_id: userId, role })
		.select("*")
		.single();

	if (error) {
		throw new Error(error.message);
	}

	return data as ProjectMember;
}

/**
 * Cập nhật vai trò của thành viên trong dự án.
 * Quyền:
 * - OWNER: đổi target sang bất kỳ role nào.
 * - MANAGER: chỉ được đổi target sang `member` hoặc `manager`;
 *   không được đổi role của OWNER và không được gán OWNER.
 */
export async function updateMemberRole(
	memberId: string,
	projectId: string,
	role: ProjectMemberRole
): Promise<ProjectMember> {
	const admin = createServiceClient();
	const user = await getLoggedUser();

	if (!user) {
		throw new Error("Bạn cần đăng nhập để đổi vai trò.");
	}

	// Lấy thông tin membership của người bị đổi role.
	const { data: target, error: targetError } = await admin
		.from("projects_members")
		.select("*")
		.eq("id", memberId)
		.single();

	if (targetError || !target) {
		throw new Error("Không tìm thấy thành viên này.");
	}

	if (target.project_id !== projectId) {
		throw new Error("Thành viên không thuộc dự án này.");
	}

	// Kiểm tra quyền người thực hiện: OWNER hoặc MANAGER.
	const actor = await checkProjectMemberRole(user.id, projectId, [
		ProjectMemberRole.OWNER,
		ProjectMemberRole.MANAGER,
	]);

	// Không cho tự đổi role chính mình qua API này (dùng nơi khác nếu cần).
	if (target.user_id === user.id) {
		throw new Error("Bạn không thể tự đổi vai trò của chính mình.");
	}

	if (actor.role === ProjectMemberRole.MANAGER) {
		// Manager không được đụng vào OWNER.
		if (target.role === ProjectMemberRole.OWNER) {
			throw new Error(
				"Quản lý không có quyền thay đổi vai trò của chủ sở hữu."
			);
		}
		// Manager không được gán OWNER.
		if (role === ProjectMemberRole.OWNER) {
			throw new Error("Chỉ chủ sở hữu mới có thể gán vai trò chủ sở hữu.");
		}
	}

	const { data, error } = await admin
		.from("projects_members")
		.update({ role })
		.eq("id", memberId)
		.select("*")
		.single();

	if (error) {
		throw new Error(error.message);
	}

	return data as ProjectMember;
}

/**
 * Xóa thành viên khỏi dự án.
 * - Không cho phép tự xóa chính mình (dùng leaveProject thay thế).
 * - Chỉ OWNER mới được xóa người khác.
 */
export async function removeMember(
	memberId: string,
	projectId: string
): Promise<{ id: string }> {
	const admin = createServiceClient();
	const user = await getLoggedUser();

	if (!user) {
		throw new Error("Bạn cần đăng nhập để xóa thành viên.");
	}

	// Lấy thông tin membership của người bị xóa.
	const { data: target, error: targetError } = await admin
		.from("projects_members")
		.select("*")
		.eq("id", memberId)
		.single();

	if (targetError || !target) {
		throw new Error("Không tìm thấy thành viên này.");
	}

	// Không cho phép tự xóa chính mình qua hàm này.
	if (target.user_id === user.id) {
		throw new Error(
			"Bạn không thể tự xóa chính mình. Vui lòng dùng chức năng rời dự án."
		);
	}

	// Kiểm tra quyền: chỉ OWNER mới được xóa thành viên khác.
	await checkProjectMemberRole(user.id, projectId, [
		ProjectMemberRole.OWNER,
	]);

	const { error: deleteError } = await admin
		.from("projects_members")
		.delete()
		.eq("id", memberId);

	if (deleteError) {
		throw new Error(deleteError.message);
	}

	return { id: memberId };
}

/**
 * Kiểm tra user có thuộc project không.
 * Trả về membership row nếu tồn tại, ngược lại null.
 */
export async function checkProjectMembership(
	userId: string,
	projectId: string
): Promise<ProjectMember | null> {
	const admin = createServiceClient();

	const { data, error } = await admin
		.from("projects_members")
		.select("*")
		.eq("user_id", userId)
		.eq("project_id", projectId)
		.maybeSingle();

	if (error) {
		throw new Error(error.message);
	}

	return data ?? null;
}

/**
 * Lấy membership của user đang đăng nhập trong một dự án.
 * Trả về null khi chưa đăng nhập hoặc không thuộc dự án.
 */
export async function getMyProjectMembership(
	projectId: string
): Promise<ProjectMember | null> {
	const user = await getLoggedUser();
	if (!user) {
		return null;
	}
	return checkProjectMembership(user.id, projectId);
}

/**
 * Kiểm tra user có role được phép trong project không.
 * Ném lỗi nếu user không thuộc project hoặc role không nằm trong danh sách cho phép.
 */
export async function checkProjectMemberRole(
	userId: string,
	projectId: string,
	allowedRoles: ProjectMemberRole[]
): Promise<ProjectMember> {
	const membership = await checkProjectMembership(userId, projectId);

	if (!membership) {
		throw new Error("Bạn không thuộc dự án này.");
	}

	if (!allowedRoles.includes(membership.role as ProjectMemberRole)) {
		throw new Error(`Bạn không có quyền thực hiện hành động này.`);
	}

	return membership;
}

/**
 * Lấy chi tiết một dự án theo id.
 * Chỉ trả về dự án khi user hiện tại là thành viên; ngược lại trả về null
 * (dùng để render 404 ở phía trang).
 */
export async function getProjectById(
	projectId: string
): Promise<Project | null> {
	const admin = createServiceClient();
	const user = await getLoggedUser();

	if (!user) {
		return null;
	}

	// Kiểm tra quyền truy cập: user phải là thành viên dự án.
	const membership = await checkProjectMembership(user.id, projectId);
	if (!membership) {
		return null;
	}

	const { data, error } = await admin
		.from("projects")
		.select("*")
		.eq("id", projectId)
		.maybeSingle();

	if (error) {
		throw new Error(error.message);
	}

	return data ?? null;
}

/**
 * Rời khỏi dự án:
 * - Nếu chỉ có 1 thành viên → xóa luôn dự án.
 * - Nếu user là chủ sở hữu duy nhất → phải chuyển quyền chủ sở hữu cho người khác trước khi rời.
 * - Còn lại → xóa membership row.
 */
export async function leaveProject(
	projectId: string
): Promise<{ deleted?: boolean }> {
	const admin = createServiceClient();
	const user = await getLoggedUser();

	if (!user) {
		throw new Error("Bạn cần đăng nhập để rời dự án.");
	}

	// Kiểm tra membership.
	const membership = await checkProjectMembership(user.id, projectId);
	if (!membership) {
		throw new Error("Bạn không thuộc dự án này.");
	}

	// Đếm tổng số thành viên.
	const { count: totalMembers, error: countError } = await admin
		.from("projects_members")
		.select("*", { count: "exact", head: true })
		.eq("project_id", projectId);

	if (countError) {
		throw new Error(countError.message);
	}

	// Chỉ có 1 thành viên → xóa luôn dự án.
	if (totalMembers === 1) {
		await deleteProject(projectId);
		return { deleted: true };
	}

	// Đếm số chủ sở hữu trong dự án.
	const { count: ownerCount, error: ownerError } = await admin
		.from("projects_members")
		.select("*", { count: "exact", head: true })
		.eq("project_id", projectId)
		.eq("role", ProjectMemberRole.OWNER);

	if (ownerError) {
		throw new Error(ownerError.message);
	}

	// Owner duy nhất → không được rời.
	if (membership.role === ProjectMemberRole.OWNER && ownerCount === 1) {
		throw new Error(
			"Bạn là chủ sở hữu duy nhất của dự án. Vui lòng chuyển quyền chủ sở hữu cho người khác trước khi rời."
		);
	}

	// Xóa membership.
	const { error: leaveError } = await admin
		.from("projects_members")
		.delete()
		.eq("project_id", projectId)
		.eq("user_id", user.id);

	if (leaveError) {
		throw new Error(leaveError.message);
	}

	return {};
}

/**
 * Xóa dự án và toàn bộ dữ liệu liên quan:
 * - Xóa folder attachments trên R2: project và tất cả task trong project.
 * - Xóa toàn bộ attachment records trong DB (project + tasks).
 * - Xóa tasks, tasks_members, projects_members, cuối cùng là project.
 */
export async function deleteProject(
	projectId: string
): Promise<{ id: string }> {
	const admin = createServiceClient();
	const user = await getLoggedUser();

	if (!user) {
		throw new Error("Bạn cần đăng nhập để xóa dự án.");
	}

	// Kiểm tra role: chỉ chủ sở hữu mới được xóa dự án.
	await checkProjectMemberRole(user.id, projectId, [ProjectMemberRole.OWNER]);

	// 1. Lấy danh sách task_id thuộc project.
	const { data: tasks, error: tasksError } = await admin
		.from("tasks")
		.select("id")
		.eq("project_id", projectId);

	if (tasksError) {
		throw new Error(tasksError.message);
	}

	const taskIds = (tasks ?? []).map(t => t.id);

	// 2. Lấy tất cả attachment IDs (project + tasks).
	const projectAttachments = await getAttachments(
		projectId,
		AttachmentUseFor.PROJECT
	);

	const taskAttachments: Awaited<ReturnType<typeof getAttachments>> = [];
	for (const taskId of taskIds) {
		const atts = await getAttachments(taskId, AttachmentUseFor.TASK);
		taskAttachments.push(...atts);
	}

	const allAttachmentIds = [
		...projectAttachments.map(a => a.id),
		...taskAttachments.map(a => a.id),
	];

	// 3. Xóa attachments (R2 + DB) bằng deleteAttachments.
	if (allAttachmentIds.length > 0) {
		await deleteAttachments(allAttachmentIds).catch(() => undefined);
	}

	// 4. Dọn folder R2 để xóa file rác (nếu có object không có record DB).
	// Folder task nằm trong `${user}/project/${projectId}/task/${taskId}` nên
	// xóa folder project là dọn luôn toàn bộ file task bên trong.
	await deleteFolder(
		await buildPath(user.id, AttachmentUseFor.PROJECT, projectId)
	).catch(() => undefined);

	// 5. Xóa tasks_members (nếu có).
	if (taskIds.length > 0) {
		await admin
			.from("tasks_members")
			.delete()
			.in("task_id", taskIds)
			.then(({ error }) => {
				if (error) throw new Error(error.message);
			});
	}

	// 6. Xóa tasks.
	await admin
		.from("tasks")
		.delete()
		.eq("project_id", projectId)
		.then(({ error }) => {
			if (error) throw new Error(error.message);
		});

	// 7. Xóa projects_members.
	await admin
		.from("projects_members")
		.delete()
		.eq("project_id", projectId)
		.then(({ error }) => {
			if (error) throw new Error(error.message);
		});

	// 8. Xóa project.
	const { error: deleteProjectError } = await admin
		.from("projects")
		.delete()
		.eq("id", projectId);

	if (deleteProjectError) {
		throw new Error(deleteProjectError.message);
	}

	return { id: projectId };
}
