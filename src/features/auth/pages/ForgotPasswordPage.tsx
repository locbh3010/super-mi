"use client";

import {
	ArrowLeftOutlined,
	CheckCircleFilled,
	MailOutlined,
	ThunderboltOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Typography } from "antd";
import Link from "next/link";
import React, { useState } from "react";
import { AUTH_ROUTES } from "../constants";
import { useAuthLayoutStyles } from "../styles";

const { Text } = Typography;

interface ForgotFormValues {
	email: string;
}

const ForgotPasswordPage: React.FC = () => {
	const { styles } = useAuthLayoutStyles();
	const [form] = Form.useForm<ForgotFormValues>();
	const [sent, setSent] = useState(false);
	const [submittedEmail, setSubmittedEmail] = useState("");

	const onFinish = (values: ForgotFormValues) => {
		setSubmittedEmail(values.email);
		setSent(true);
	};

	return (
		<div className={styles.root}>
			<div className={styles.center}>
				{/* Thương hiệu */}
				<div className={styles.brand}>
					<div className={styles.brandIcon}>
						<ThunderboltOutlined />
					</div>
					<span className={styles.brandName}>Org AI Platform</span>
				</div>

				{/* Card */}
				<div className={styles.card}>
					{!sent ? (
						<>
							<div className={styles.cardHeader}>
								<div className={styles.cardTitle}>
									Khôi phục mật khẩu
								</div>
								<Text className={styles.cardSubtitle}>
									Nhập email liên kết với tài khoản của bạn,
									chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
								</Text>
							</div>

							<Form
								form={form}
								layout="vertical"
								onFinish={onFinish}
								requiredMark={false}
							>
								<Form.Item
									name="email"
									label="Địa chỉ email"
									className={styles.formItem}
									rules={[
										{
											required: true,
											message: "Vui lòng nhập email",
										},
										{
											type: "email",
											message: "Email không hợp lệ",
										},
									]}
								>
									<Input
										prefix={<MailOutlined />}
										placeholder="ban@example.com"
										className={styles.input}
									/>
								</Form.Item>

								<Form.Item style={{ marginBottom: 0 }}>
									<Button
										type="primary"
										htmlType="submit"
										className={styles.submitBtn}
									>
										Gửi liên kết đặt lại
									</Button>
								</Form.Item>
							</Form>
						</>
					) : (
						/* ── Trạng thái thành công ── */
						<div style={{ textAlign: "center", padding: "8px 0" }}>
							<div className={styles.successIcon}>
								<CheckCircleFilled />
							</div>
							<div className={styles.cardTitle}>
								Kiểm tra hộp thư
							</div>
							<Text
								className={styles.cardSubtitle}
								style={{ display: "block", marginTop: 8 }}
							>
								Chúng tôi đã gửi liên kết đặt lại mật khẩu đến{" "}
								<strong style={{ whiteSpace: "nowrap" }}>
									{submittedEmail}
								</strong>
								. Liên kết có hiệu lực trong 15 phút.
							</Text>

							<Button
								type="primary"
								className={styles.submitBtn}
								style={{ marginTop: 28 }}
								onClick={() => {
									setSent(false);
									form.resetFields();
								}}
							>
								Gửi lại email
							</Button>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className={styles.footer}>
					<Link href={AUTH_ROUTES.LOGIN} className={styles.link}>
						<ArrowLeftOutlined
							style={{ marginRight: 6, fontSize: 12 }}
						/>
						Quay lại đăng nhập
					</Link>
				</div>
			</div>
		</div>
	);
};

export default ForgotPasswordPage;
