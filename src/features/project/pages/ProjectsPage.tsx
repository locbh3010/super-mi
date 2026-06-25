"use client";

import { type PageSize } from "@/constants/parser";
import {
	ClearOutlined,
	MailOutlined,
	PlusOutlined,
	SearchOutlined,
} from "@ant-design/icons";
import { Badge, Button, Card, Flex, Input, Tooltip } from "antd";
import { useState } from "react";
import { useFetchReceiveInvitees } from "@/features/invite/hooks/use-fetch-receive-invitees";
import { ReceiveInvitesModal } from "@/features/invite/components";
import { MemberSelect } from "../components/MemberSelect";
import { ProjectFormDrawer } from "../components/ProjectFormDrawer";
import { ProjectsTable } from "../components/ProjectsTable";
import { useFetchProjects } from "../hooks/use-fetch-projects";
import { useProjectsPageStyles } from "../styles";

export function ProjectsPage() {
	const { styles } = useProjectsPageStyles();

	const {
		setFilters,
		resetFilters,
		hasFilters,
		searchInput,
		onSearchChange,
		members,
		onMembersChange,
		page,
		pageSize,
		sort,
		projects,
		isLoading,
		total,
		isFetching,
	} = useFetchProjects();

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [invitesModalOpen, setInvitesModalOpen] = useState(false);
	const { data: receiveInvitees = [] } = useFetchReceiveInvitees();
	const pendingInviteCount = receiveInvitees.length;

	return (
		<div>
			<Card size="small" className={styles.toolbarCard}>
				<Flex
					align="center"
					justify="space-between"
					gap="middle"
					wrap="wrap"
					className={styles.toolbar}
				>
					<Flex align="center" gap="small" flex={1} wrap="wrap">
						<Input
							className={styles.search}
							prefix={<SearchOutlined />}
							placeholder="Tìm kiếm dự án..."
							allowClear
							value={searchInput}
							onChange={e => onSearchChange(e.target.value)}
						/>
						<MemberSelect
							className={styles.filter}
							value={members}
							onChange={onMembersChange}
						/>
					</Flex>

					<Flex align="center" gap="small" wrap="wrap">
						<Button
							icon={<ClearOutlined />}
							onClick={resetFilters}
							disabled={!hasFilters}
						>
							Xóa bộ lọc
						</Button>
						<Button
							type="primary"
							icon={<PlusOutlined />}
							onClick={() => setDrawerOpen(true)}
						>
							Thêm dự án
						</Button>
						<Tooltip title="Lời mời nhận được">
							<Badge
								count={pendingInviteCount}
								size="small"
								offset={[-4, 4]}
							>
								<Button
									icon={<MailOutlined />}
									onClick={() => setInvitesModalOpen(true)}
								/>
							</Badge>
						</Tooltip>
					</Flex>
				</Flex>
			</Card>

			<ProjectsTable
				data={projects}
				loading={isLoading || isFetching}
				total={total}
				page={page}
				pageSize={pageSize}
				onPaginationChange={(nextPage, nextPageSize) => {
					setFilters({
						page: nextPage,
						pageSize: nextPageSize as PageSize,
					});
				}}
				sort={sort}
				onSortChange={nextSort => {
					setFilters({ sort: nextSort, page: 1 });
				}}
			/>

			<ProjectFormDrawer
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
			/>

			<ReceiveInvitesModal
				open={invitesModalOpen}
				onClose={() => setInvitesModalOpen(false)}
			/>
		</div>
	);
}
