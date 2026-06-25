"use client";

import { CheckSquareOutlined, TeamOutlined } from "@ant-design/icons";
import { Card, Tabs, Typography } from "antd";
import { useState } from "react";
import { MembersTab, TasksTab } from "../components/project-detail";
import { useProjectMyMembership } from "../hooks/use-project-my-membership";
import { useRemoveMember } from "../hooks/use-remove-member";
import { useProjectDetailStyles } from "../styles";
import { InviteUserModal } from "@/features/invite/components/InviteUserModal";

type ProjectPageProps = {
	projectId: string;
};

export function ProjectPage({ projectId }: ProjectPageProps) {
	const { styles } = useProjectDetailStyles();
	const [inviteOpen, setInviteOpen] = useState(false);

	const { data: myMembership } = useProjectMyMembership(projectId);
	const { mutate: removeMember } = useRemoveMember(projectId);
	const currentUserRole = myMembership?.role ?? null;
	const currentUserId = myMembership?.user_id ?? null;

	return (
		<div className={styles.page}>
			<Card className={styles.tabsCard} size="small">
				<Tabs
					defaultActiveKey="tasks"
					items={[
						{
							key: "tasks",
							label: (
								<Typography.Text>
									<CheckSquareOutlined /> Công việc
								</Typography.Text>
							),
							children: <TasksTab projectId={projectId} />,
							destroyOnHidden: true,
						},
						{
							key: "members",
							label: (
								<Typography.Text>
									<TeamOutlined /> Thành viên
								</Typography.Text>
							),
							children: (
								<MembersTab
									projectId={projectId}
									currentUserRole={currentUserRole}
									currentUserId={currentUserId}
									onAddMember={() => setInviteOpen(true)}
									onMemberRemove={member => removeMember(member.id)}
								/>
							),
							destroyOnHidden: true,
						},
					]}
				/>
			</Card>

			<InviteUserModal
				open={inviteOpen}
				onClose={() => setInviteOpen(false)}
				projectId={projectId}
			/>
		</div>
	);
}
