"use client";

import {
	MoreOutlined,
	SearchOutlined,
	UserAddOutlined,
} from "@ant-design/icons";
import type { MenuProps, TableProps } from "antd";
import {
	Avatar,
	Button,
	Dropdown,
	Input,
	Space,
	Table,
	Tag,
	Typography,
} from "antd";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { useProjectDetailStyles } from "../../styles";
import { useProjectMembersTab } from "../../hooks/use-project-members-tab";
import { useUpdateMemberRole } from "../../hooks/use-update-member-role";
import { ProjectMemberRole } from "../../types";
import { ROLE_META } from "../../constants";
import type { ProjectMembersResult } from "../../types";
import { modal } from "@/components/providers/Providers";

type MemberRow = ProjectMembersResult["items"][number];

function formatDate(iso: string) {
	const d = dayjs(iso);
	return d.isValid() ? d.format("DD/MM/YYYY") : "—";
}

type Props = {
	projectId: string;
	/** Role của user hiện tại trong dự án. */
	currentUserRole?: string | null;
	/** User id hiện tại — chặn hành động tự xóa/tự đổi role chính mình. */
	currentUserId?: string | null;
	/** Mở modal thêm thành viên. */
	onAddMember?: () => void;
	/** Xóa thành viên khỏi dự án — chỉ OWNER mới có callback này. */
	onMemberRemove?: (member: MemberRow) => void;
};

export function MembersTab({
	projectId,
	currentUserRole,
	currentUserId,
	onAddMember,
	onMemberRemove,
}: Props) {
	const { styles } = useProjectDetailStyles();
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [search, setSearch] = useState("");

	const { members, isLoadingMembers } = useProjectMembersTab({
		projectId,
		page,
		limit,
		search: search || undefined,
	});

	const { mutate: updateMemberRole } = useUpdateMemberRole(projectId);

	const isOwner = currentUserRole === ProjectMemberRole.OWNER;
	const isManager = currentUserRole === ProjectMemberRole.MANAGER;
	const canChangeRoles = isOwner || isManager;

	/** Xác nhận trước khi xóa — dùng modal.confirm để không xung đột Dropdown. */
	const confirmRemove = useCallback(
		(member: MemberRow) => {
			if (!onMemberRemove) {
				return;
			}
			modal.confirm({
				title: "Xóa thành viên khỏi dự án?",
				content: (
					<span>
						Thành viên{" "}
						<strong>
							{member.user?.display_name ?? member.user?.email ?? "—"}
						</strong>{" "}
						sẽ bị xóa khỏi dự án. Hành động này không thể hoàn tác.
					</span>
				),
				okText: "Xóa",
				cancelText: "Hủy",
				okButtonProps: { danger: true },
				onOk: () => onMemberRemove(member),
			});
		},
		[onMemberRemove]
	);

	/**
	 * Submenu "Đổi vai trò" — build options theo quyền actor + target row.
	 *  - OWNER  → bất kỳ row khác: member / manager / owner.
	 *  - MANAGER → row không phải owner: member / manager.
	 *  - Self   → null (không tự đổi chính mình).
	 */
	const buildRoleSubmenu = useCallback(
		(record: MemberRow, isSelf: boolean): NonNullable<MenuProps["items"]> | null => {
			if (!canChangeRoles) return null;
			if (isSelf) return null;
			// Manager không được đụng vào owner.
			if (isManager && record.role === ProjectMemberRole.OWNER) {
				return null;
			}

			const options: Array<{ key: ProjectMemberRole; disabled: boolean }> = [
				{
					key: ProjectMemberRole.MEMBER,
					disabled: record.role === ProjectMemberRole.MEMBER,
				},
				{
					key: ProjectMemberRole.MANAGER,
					disabled: record.role === ProjectMemberRole.MANAGER,
				},
			];

			if (isOwner) {
				options.push({
					key: ProjectMemberRole.OWNER,
					disabled: record.role === ProjectMemberRole.OWNER,
				});
			}

			return options.map(opt => ({
				key: `role:${opt.key}`,
				label: ROLE_META[opt.key].label,
				disabled: opt.disabled,
			}));
		},
		[canChangeRoles, isManager, isOwner]
	);

	/**
	 * Build menu items theo từng row:
	 *  - OWNER   → đổi role (kể cả owner khác) + xóa (kể cả owner khác).
	 *  - MANAGER → chỉ đổi role member↔manager.
	 *  - Manager không xóa ai.
	 *  - Self → hiện "—".
	 */
	const buildRowMenu = useMemo(
		() =>
			(record: MemberRow): NonNullable<MenuProps["items"]> => {
				const items: NonNullable<MenuProps["items"]> = [];
				const isSelf = !!currentUserId && record.user_id === currentUserId;

				const roleChildren = buildRoleSubmenu(record, isSelf);
				if (roleChildren && roleChildren.length > 0) {
					items.push({
						key: "role",
						label: "Đổi vai trò",
						children: roleChildren,
					});
				}

				// Chỉ OWNER mới có nút xóa, nhưng không được xóa chính mình.
				const canRemove = isOwner && !isSelf && !!onMemberRemove;
				if (canRemove) {
					items.push({
						key: "remove",
						label: "Xóa khỏi dự án",
						danger: true,
					});
				}

				return items;
			},
		[buildRoleSubmenu, currentUserId, isOwner, onMemberRemove]
	);

	const columns: TableProps<MemberRow>["columns"] = [
		{
			title: "Thành viên",
			key: "name",
			render: (_, record) => (
				<Space size="small">
					<Avatar src={record.user?.avatar_url}>
						{(record.user?.display_name ?? "").charAt(0).toUpperCase()}
					</Avatar>
					<Typography.Text strong>
						{record.user?.display_name ?? "—"}
					</Typography.Text>
				</Space>
			),
		},
		{
			title: "Email",
			key: "email",
			render: (_, record) => (
				<Typography.Text type="secondary">
					{record.user?.email ?? "—"}
				</Typography.Text>
			),
		},
		{
			title: "Vai trò",
			dataIndex: "role",
			key: "role",
			width: 150,
			render: (role: string) => {
				const meta = ROLE_META[role as ProjectMemberRole];
				return meta ? (
					<Tag color={meta.color}>{meta.label}</Tag>
				) : (
					<Tag>{role}</Tag>
				);
			},
		},
		{
			title: "Ngày tham gia",
			dataIndex: "created_at",
			key: "created_at",
			width: 150,
			render: (iso: string) => formatDate(iso),
		},
		{
			title: "Thao tác",
			key: "actions",
			width: 110,
			align: "center",
			render: (_, record) => {
				const items = buildRowMenu(record);
				if (items.length === 0) {
					return null;
				}
				return (
					<Dropdown
						menu={{
							items,
							onClick: ({ key, domEvent }) => {
								domEvent?.stopPropagation?.();
								if (key === "remove") {
									confirmRemove(record);
									return;
								}
								if (typeof key === "string" && key.startsWith("role:")) {
									const role = key.slice(
										"role:".length
									) as ProjectMemberRole;
									updateMemberRole({
										memberId: record.id,
										role,
									});
								}
							},
						}}
						trigger={["click"]}
						placement="bottomRight"
					>
						<Button type="text" icon={<MoreOutlined />} />
					</Dropdown>
				);
			},
		},
	];

	return (
		<div>
			<div className={styles.toolbar}>
				<Input
					className={styles.search}
					prefix={<SearchOutlined />}
					placeholder="Tìm kiếm thành viên..."
					allowClear
					value={search}
					onChange={e => {
						setSearch(e.target.value);
						setPage(1);
					}}
				/>
				<div className={styles.toolbarRight}>
					<Button
						type="primary"
						icon={<UserAddOutlined />}
						onClick={onAddMember}
					>
						Thêm thành viên
					</Button>
				</div>
			</div>

			<div className={styles.tableCard}>
				<Table<MemberRow>
					rowKey="id"
					columns={columns}
					dataSource={members?.items}
					loading={isLoadingMembers}
					scroll={{ x: "max-content" }}
					pagination={{
						current: page,
						pageSize: limit,
						total: members?.total ?? 0,
						showTotal: total => `Tổng ${total} thành viên`,
						showSizeChanger: true,
						pageSizeOptions: ["5", "10", "20", "50"],
						style: { paddingInline: 12 },
						onChange: (p, ps) => {
							setPage(p);
							setLimit(ps);
						},
					}}
				/>
			</div>
		</div>
	);
}
