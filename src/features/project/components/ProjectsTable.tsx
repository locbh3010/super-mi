"use client";
import { PAGE_SIZE_OPTIONS, type SortValue } from "@/constants/parser";
import {
	CalendarOutlined,
	DeleteOutlined,
	LogoutOutlined,
	MailOutlined,
	PictureOutlined,
} from "@ant-design/icons";
import type { TableProps } from "antd";
import { Avatar, Button, Image, Popconfirm, Progress, Space, Table, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import { useProjectsPageStyles } from "../styles";
import {
	ProjectMemberRole,
	type ProjectMembersResult,
	type ProjectWithMembers,
} from "../types";
import { useRouter } from "next/navigation";
import { generateUrl } from "@/utils/generate-url";
import { ROUTES } from "@/constants/routes";
import { InviteUserModal } from "@/features/invite/components";
import { useState } from "react";
import { useDeleteProject } from "../hooks/use-delete-project";
import { useLeaveProject } from "../hooks/use-leave-project";

type ProjectsTableProps = {
	data: ProjectWithMembers[];
	page: number;
	pageSize: number;
	total?: number;
	loading?: boolean;
	onPaginationChange: (page: number, pageSize: number) => void;
	sort: SortValue | null;
	onSortChange: (sort: SortValue | null) => void;
};

function sortOrderFor(
	sort: SortValue | null,
	id: string
): "ascend" | "descend" | null {
	if (!sort || sort.id !== id) return null;
	return sort.desc ? "descend" : "ascend";
}

function formatDate(iso: string) {
	const d = dayjs(iso);
	return d.isValid() ? d.format("DD/MM/YY HH:mm") : "—";
}

const ROLE_META: Record<string, { label: string; color: string }> = {
	[ProjectMemberRole.OWNER]: { label: "Chủ sở hữu", color: "gold" },
	[ProjectMemberRole.MANAGER]: { label: "Quản lý", color: "blue" },
	[ProjectMemberRole.MEMBER]: { label: "Thành viên", color: "default" },
};

type MemberItem = ProjectMembersResult["items"][number];

/** Nội dung hovercard chi tiết cho 1 thành viên. */
function MemberHoverCard({ member }: { member: MemberItem }) {
	const { user, role, created_at } = member;
	const name = user.display_name || user.email || "Không rõ";
	const roleMeta = ROLE_META[role] ?? { label: role, color: "default" };

	return (
		<div style={{ minWidth: 220, padding: 4 }}>
			<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
				<Avatar
					size={48}
					src={user.avatar_url ?? undefined}
					style={{ flexShrink: 0 }}
				>
					{name.charAt(0)?.toUpperCase() ?? "?"}
				</Avatar>
				<div style={{ minWidth: 0 }}>
					<div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
					<Tag color={roleMeta.color} style={{ marginTop: 4 }}>
						{roleMeta.label}
					</Tag>
				</div>
			</div>
			<div style={{ marginTop: 10, display: "grid", gap: 6 }}>
				<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
					<MailOutlined style={{ opacity: 0.65 }} />
					<span style={{ wordBreak: "break-all" }}>
						{user.email ?? "—"}
					</span>
				</div>
				<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
					<CalendarOutlined style={{ opacity: 0.65 }} />
					<span>Tham gia: {formatDate(created_at)}</span>
				</div>
			</div>
		</div>
	);
}

function renderUserAvatars({ items }: ProjectMembersResult) {
	if (!items?.length) return <span style={{ color: "#bfbfbf" }}>—</span>;
	return (
		<Avatar.Group max={{ count: 3 }} size="small">
			{items.map(member => {
				const { user } = member;
				const label = user.display_name || user.email;
				return (
					<Tooltip
						key={user.id}
					title={<MemberHoverCard member={member} />}
					color="#fff"
					styles={{ root: { color: "rgba(0, 0, 0, 0.88)" } }}
				>
						<Avatar size="small" src={user.avatar_url ?? undefined}>
							{label?.charAt(0)?.toUpperCase() ?? "?"}
						</Avatar>
					</Tooltip>
				);
			})}
		</Avatar.Group>
	);
}

export function ProjectsTable({
	data,
	page,
	pageSize,
	total,
	loading,
	onPaginationChange,
	sort,
	onSortChange,
}: ProjectsTableProps) {
	const { styles } = useProjectsPageStyles();
	const router = useRouter();

	const [inviteModalOpen, setInviteModalOpen] = useState(false);
	const [invitedProjectId, setInvitedProjectId] = useState<string>("");
	const [invitedProjectName, setInvitedProjectName] = useState<string>("");

	const { mutate: deleteProjectMutate, isPending: isDeleting } =
		useDeleteProject();

	const { mutate: leaveProjectMutate, isPending: isLeaving } =
		useLeaveProject();

	const columns: TableProps<ProjectWithMembers>["columns"] = [
		{
			title: "Ảnh",
			dataIndex: "thumbnail_url",
			key: "thumbnail",
			width: 80,
			render: (url?: string) =>
				url ? (
					<Image
						src={url}
						alt="thumbnail"
						width={56}
						height={56}
						className={styles.thumb}
						preview={false}
						fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"
					/>
				) : (
					<div className={styles.thumbFallback}>
						<PictureOutlined />
					</div>
				),
		},
		{
			title: "Tên dự án",
			dataIndex: "name",
			key: "name",
			sorter: true,
			sortOrder: sortOrderFor(sort, "name"),
			render: (_, record) => (
				<div className={styles.nameCell}>
					<span className={styles.nameText}>{record.name}</span>
					{record.description ? (
						<Tooltip title={record.description}>
							<span className={styles.descText}>
								{record.description}
							</span>
						</Tooltip>
					) : null}
				</div>
			),
		},
		{
			title: "Tiến độ",
			dataIndex: "progress",
			key: "progress",
			width: 180,
			sorter: true,
			sortOrder: sortOrderFor(sort, "progress"),
			render: (progress: number) => (
				<div className={styles.progressCell}>
					<Progress
						percent={progress}
						size="small"
						status={progress >= 100 ? "success" : "active"}
					/>
				</div>
			),
		},
		{
			title: "Thành viên",
			dataIndex: "members",
			key: "members",
			width: 160,
			render: (members: ProjectMembersResult) =>
				renderUserAvatars(members),
		},
		{
			title: "Ngày tạo",
			dataIndex: "created_at",
			key: "createdAt",
			width: 130,
			sorter: true,
			sortOrder: sortOrderFor(sort, "createdAt"),
			render: (iso: string) => formatDate(iso),
		},
		{
			title: "Thao tác",
			key: "actions",
			width: 140,
			align: "center",
			render: (_, record) => (
				<Space size={4}>
					<Tooltip title="Mời thành viên">
						<Button
							type="text"
							icon={<MailOutlined />}
							onClick={e => {
								e.stopPropagation();
								setInvitedProjectId(record.id);
								setInvitedProjectName(record.name);
								setInviteModalOpen(true);
							}}
						/>
					</Tooltip>
					<Tooltip title="Rời dự án">
						<Popconfirm
							title="Rời dự án"
							description="Bạn có chắc chắn muốn rời dự án này?"
							onConfirm={e => {
								e?.stopPropagation();
								leaveProjectMutate(record.id);
							}}
							onCancel={e => e?.stopPropagation()}
							okText="Rời"
							cancelText="Hủy"
							okButtonProps={{ danger: true, loading: isLeaving }}
						>
							<Button
								type="text"
								icon={<LogoutOutlined />}
								onClick={e => {
									e.stopPropagation();
								}}
							/>
						</Popconfirm>
					</Tooltip>
					<Tooltip title="Xóa">
						<Popconfirm
							title="Xóa dự án"
							description="Bạn có chắc chắn muốn xóa dự án này? Hành động này không thể hoàn tác."
							onConfirm={e => {
								e?.stopPropagation();
								deleteProjectMutate(record.id);
							}}
							onCancel={e => e?.stopPropagation()}
							okText="Xóa"
							cancelText="Hủy"
							okButtonProps={{ danger: true, loading: isDeleting }}
						>
							<Button
								type="text"
								danger
								icon={<DeleteOutlined />}
								onClick={e => {
									e.stopPropagation();
								}}
							/>
						</Popconfirm>
					</Tooltip>
				</Space>
			),
		},
	];

	return (
		<div className={styles.tableCard}>
			<Table<ProjectWithMembers>
				rowKey="id"
				columns={columns}
				dataSource={data}
				loading={loading}
				scroll={{ x: "max-content" }}
				onRow={row => ({
					onClick: () =>
						router.push(
							generateUrl(ROUTES.DASHBOARD.PROJECT, {
								params: { id: row.id },
							})
						),
				})}
				onChange={(_pagination, _filters, sorter, extra) => {
					if (extra.action !== "sort") return;
					const s = Array.isArray(sorter) ? sorter[0] : sorter;
					if (s?.columnKey && s.order) {
						onSortChange({
							id: String(s.columnKey),
							desc: s.order === "descend",
						});
					} else {
						onSortChange(null);
					}
				}}
				pagination={{
					current: page,
					pageSize,
					total,
					showTotal: total => `Tổng ${total} dự án`,
					showSizeChanger: true,
					pageSizeOptions: [...PAGE_SIZE_OPTIONS],
					onChange: onPaginationChange,
					style: {
						paddingLeft: 12,
						paddingRight: 12,
					},
				}}
			/>

			<InviteUserModal
				open={inviteModalOpen}
				onClose={() => setInviteModalOpen(false)}
				projectId={invitedProjectId}
				projectName={invitedProjectName}
			/>
		</div>
	);
}
