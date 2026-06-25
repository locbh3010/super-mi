"use client";

import {
	LockOutlined,
	MailOutlined,
	ThunderboltOutlined,
} from "@ant-design/icons";
import { Alert, Button, Divider, Form, Input, Typography } from "antd";
import Link from "next/link";
import React from "react";
import { AUTH_ROUTES } from "../constants";
import { useAuthLayoutStyles } from "../styles";
import { LoginFormValues } from "../types";
import { useLogin } from "../hooks/use-login";
import OAuthButtons from "../components/OAuthButtons";

const { Text } = Typography;

const LoginPage: React.FC = () => {
	const { styles } = useAuthLayoutStyles();
	const [form] = Form.useForm<LoginFormValues>();
	const { mutate: login, isPending, error, isError } = useLogin();

	const onFinish = (values: LoginFormValues) => {
		login(values);
	};

	return (
		<div className={styles.root}>
			<div className={styles.center}>
				{/* Brand */}
				<div className={styles.brand}>
					<div className={styles.brandIcon}>
						<ThunderboltOutlined />
					</div>
					<span className={styles.brandName}>Org AI Platform</span>
				</div>

				{/* Card */}
				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div className={styles.cardTitle}>
							Chào mừng trở lại
						</div>
						<Text className={styles.cardSubtitle}>
							Đăng nhập để tiếp tục sử dụng tài khoản
						</Text>
					</div>

					{isError && error?.message && (
						<Alert
							style={{
								marginBottom: 16,
							}}
							title="Thất bại!!!"
							description={error?.message}
							type="error"
						/>
					)}

					{/* OAuth */}
					<OAuthButtons />

					<Divider>
						<Text className={styles.dividerText}>
							hoặc tiếp tục với email
						</Text>
					</Divider>

					{/* Form */}
					<Form
						form={form}
						layout="vertical"
						onFinish={onFinish}
						requiredMark={false}
					>
						<Form.Item
							name="email"
							label="Email"
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

						<Form.Item
							name="password"
							label={
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										width: "100%",
									}}
								>
									<span>Mật khẩu</span>
									<Link
										href={AUTH_ROUTES.FORGOT_PASSWORD}
										className={styles.forgotLink}
									>
										Quên mật khẩu?
									</Link>
								</div>
							}
							className={styles.formItem}
							rules={[
								{
									required: true,
									message: "Vui lòng nhập mật khẩu",
								},
							]}
						>
							<Input.Password
								prefix={<LockOutlined />}
								placeholder="Nhập mật khẩu"
								className={`${styles.input} ${styles.passwordInput}`}
							/>
						</Form.Item>

						<Form.Item style={{ marginBottom: 0 }}>
							<Button
								type="primary"
								htmlType="submit"
								className={styles.submitBtn}
								loading={isPending}
							>
								Đăng nhập
							</Button>
						</Form.Item>
					</Form>
				</div>

				{/* Footer */}
				<div className={styles.footer}>
					Chưa có tài khoản?{" "}
					<Link href={AUTH_ROUTES.REGISTER} className={styles.link}>
						Tạo tài khoản miễn phí
					</Link>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
