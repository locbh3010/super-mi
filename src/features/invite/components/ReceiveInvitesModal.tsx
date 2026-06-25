"use client";

import { CheckOutlined, CloseOutlined, MailOutlined } from "@ant-design/icons";
import {
	Avatar,
	Button,
	Empty,
	Modal,
	Popconfirm,
	Spin,
	Typography,
} from "antd";
import Image from "next/image";
import { useFetchReceiveInvitees } from "../hooks/use-fetch-receive-invitees";
import { useAcceptInvite } from "../hooks/use-accept-invite";
import { useRejectInvite } from "../hooks/use-reject-invite";
import { useReceiveInvitesStyles } from "../styles";
import type { Tables } from "@/types/database";

interface ReceiveInvitesModalProps {
	open: boolean;
	onClose: () => void;
}

type ProjectRow = Tables<"projects">;
type ProfileRow = Tables<"profiles">;

interface InviteWithProject {
	id: string;
	project_id: string;
	receive_email: string;
	sender_id: string;
	created_at: string;
	status: string;
	project: ProjectRow | null;
	sender: ProfileRow | null;
}

export function ReceiveInvitesModal({
	open,
	onClose,
}: ReceiveInvitesModalProps) {
	const { styles } = useReceiveInvitesStyles();
	const { data: receiveInvitees = [], isLoading } = useFetchReceiveInvitees();
	const { mutate: acceptInvite, isPending: isAccepting } = useAcceptInvite();
	const { mutate: rejectInvite, isPending: isRejecting } = useRejectInvite();

	const invites = receiveInvitees as InviteWithProject[];

	return (
		<Modal
			title={
				<span>
					<MailOutlined style={{ marginRight: 8 }} />
					Lời mời nhận được
				</span>
			}
			open={open}
			onCancel={onClose}
			footer={null}
			destroyOnHidden
			width={640}
		>
			{isLoading ? (
				<div className={styles.loading}>
					<Spin />
				</div>
			) : invites.length === 0 ? (
				<Empty description="Không có lời mời nào" />
			) : (
				invites.map((item, idx) => {
					const project = item.project;
					const sender = item.sender;
					const isLast = idx === invites.length - 1;

					return (
						<div
							key={item.id}
							className={
								isLast
									? styles.inviteItemLast
									: styles.inviteItem
							}
						>
							<div className={styles.thumbnail}>
								{project?.thumbnail_url ? (
									<Image
										src={project.thumbnail_url}
										alt={project.name ?? "thumbnail"}
										fill
										style={{ objectFit: "cover" }}
									/>
								) : (
									<Typography.Text
										type="secondary"
										className={styles.thumbnailPlaceholder}
									>
										No image
									</Typography.Text>
								)}
							</div>

							<div className={styles.info}>
								<div className={styles.projectSection}>
									<div className={styles.nameRow}>
										<Typography.Text
											className={styles.projectName}
											ellipsis
										>
											{project?.name ?? item.project_id}
										</Typography.Text>
									</div>

									{project?.description && (
										<Typography.Paragraph
											className={styles.desc}
											type="secondary"
											ellipsis={{ rows: 2 }}
										>
											{project.description}
										</Typography.Paragraph>
									)}
								</div>

								{sender && (
									<div className={styles.senderSection}>
										<Avatar
											className={styles.senderAvatar}
											src={sender.avatar_url ?? undefined}
											size={24}
										>
											{(
												sender.display_name ??
												sender.email ??
												"?"
											).charAt(0)}
										</Avatar>
										<div className={styles.senderMeta}>
											<span
												className={styles.senderLabel}
											>
												Người mời:
											</span>
											<Typography.Text
												className={styles.senderName}
											>
												{sender.display_name ??
													sender.email ??
													sender.id}
											</Typography.Text>
											{sender.display_name &&
												sender.email && (
													<Typography.Text
														className={
															styles.senderEmail
														}
														ellipsis
													>
														{sender.email}
													</Typography.Text>
												)}
										</div>
									</div>
								)}

								<div className={styles.actions}>
									<Popconfirm
										title="Từ chối lời mời này?"
										description="Bạn có chắc muốn từ chối?"
										onConfirm={() => rejectInvite(item.id)}
										okText="Từ chối"
										cancelText="Huỷ"
										okButtonProps={{ danger: true }}
									>
										<Button
											size="small"
											danger
											icon={<CloseOutlined />}
											loading={isRejecting}
										>
											Từ chối
										</Button>
									</Popconfirm>
									<Popconfirm
										title="Chấp nhận lời mời này?"
										description="Bạn sẽ được thêm vào dự án."
										onConfirm={() => acceptInvite(item.id)}
										okText="Chấp nhận"
										cancelText="Huỷ"
									>
										<Button
											type="primary"
											size="small"
											icon={<CheckOutlined />}
											loading={isAccepting}
										>
											Chấp nhận
										</Button>
									</Popconfirm>
								</div>
							</div>
						</div>
					);
				})
			)}
		</Modal>
	);
}
