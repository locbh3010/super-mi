"use client";

import { CloseOutlined, MailOutlined } from "@ant-design/icons";
import { Alert, Button, Empty, Form, Input, Modal, Popconfirm, Spin, Tag } from "antd";
import { useCancelInvite } from "../hooks/use-cancel-invite";
import { useFetchInvitees } from "../hooks/use-fetch-invitees";
import { useSendInvite } from "../hooks/use-send-invite";
import { InviteStatus } from "../types";

interface InviteUserModalProps {
	open: boolean;
	onClose: () => void;
	projectId: string;
	projectName?: string;
	/** Gọi sau khi gửi lời mời thành công (để refresh dữ liệu bên ngoài). */
	onInvited?: () => void;
}

export function InviteUserModal({
	open,
	onClose,
	projectId,
	projectName,
	onInvited,
}: InviteUserModalProps) {
	const [form] = Form.useForm();
	const { data: invitees = [], isLoading } = useFetchInvitees(projectId);
	const {
		mutate: sendInvite,
		isPending: isSending,
		error,
		reset: resetMutation,
	} = useSendInvite();

	const {
		mutate: cancelInvite,
		isPending: isCancelling,
	} = useCancelInvite();

	const pendingInvitees = invitees.filter(
		item => item.status === InviteStatus.PENDING
	);

	const handleFinish = (values: { email: string }) => {
		resetMutation();
		sendInvite(
			{ projectId, receiveEmail: values.email },
			{
				onSuccess: () => {
					form.resetFields();
					onInvited?.();
				},
			}
		);
	};

	const handleClose = () => {
		resetMutation();
		onClose();
	};

	return (
		<Modal
			title={
				<span>
					Mời thành viên vào dự án{" "}
					<strong style={{ color: "#1890ff" }}>
						{projectName ?? projectId}
					</strong>
				</span>
			}
			open={open}
			onCancel={handleClose}
			footer={null}
			destroyOnHidden
		>
			{error && (
				<Alert
					description={error.message}
					type="error"
					showIcon
					style={{ marginTop: 8 }}
				/>
			)}

			<Form
				form={form}
				layout="vertical"
				onFinish={handleFinish}
				style={{ marginTop: 16 }}
			>
				<Form.Item
					name="email"
					label="Email người nhận"
					rules={[
						{ required: true, message: "Vui lòng nhập email!" },
						{ type: "email", message: "Email không hợp lệ!" },
					]}
				>
					<Input
						prefix={
							<MailOutlined
								style={{ color: "rgba(0,0,0,.25)" }}
							/>
						}
						placeholder="Nhập email để mời..."
					/>
				</Form.Item>

				<Form.Item>
					<Button
						type="primary"
						htmlType="submit"
						block
						loading={isSending}
					>
						Gửi lời mời
					</Button>
				</Form.Item>
			</Form>

			<div style={{ marginTop: 24 }}>
				<div style={{ fontWeight: 600, marginBottom: 8 }}>
					Danh sách đã mời (Chờ xác nhận)
				</div>
				{isLoading ? (
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							padding: "32px 0",
						}}
					>
						<Spin />
					</div>
				) : pendingInvitees.length === 0 ? (
					<Empty
						description="Không có lời mời nào đang chờ"
						image={Empty.PRESENTED_IMAGE_SIMPLE}
					/>
				) : (
					<div
						style={{
							border: "1px solid #d9d9d9",
							borderRadius: 6,
							overflow: "hidden",
						}}
					>
						{pendingInvitees.map((item, idx) => (
							<div
								key={item.id}
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									padding: "8px 12px",
									borderBottom:
										idx < pendingInvitees.length - 1
											? "1px solid #f0f0f0"
											: "none",
								}}
							>
								<span>{item.receive_email}</span>
								<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
									<Tag color="orange">Chờ chấp nhận</Tag>
									<Popconfirm
										title="Huỷ lời mời này?"
										description="Người nhận sẽ không còn thấy lời mời."
										onConfirm={() => cancelInvite(item.id)}
										okText="Huỷ"
										cancelText="Thôi"
										okButtonProps={{ danger: true }}
									>
										<Button
											size="small"
											type="text"
											danger
											icon={<CloseOutlined />}
											loading={isCancelling}
										/>
									</Popconfirm>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</Modal>
	);
}
