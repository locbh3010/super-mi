"use client";

import {
	LockOutlined,
	MailOutlined,
	ThunderboltOutlined,
} from "@ant-design/icons";
import {
	Alert,
	Button,
	Checkbox,
	Divider,
	Form,
	Input,
	Typography,
} from "antd";
import Link from "next/link";
import React from "react";
import { AUTH_ROUTES } from "../constants";
import { useAuthLayoutStyles } from "../styles";
import { RegisterFormValues } from "../types";
import { useRegister } from "../hooks/use-register";
import OAuthButtons from "../components/OAuthButtons";

const { Text } = Typography;

const RegisterPage: React.FC = () => {
	const { styles } = useAuthLayoutStyles();
	const [form] = Form.useForm<RegisterFormValues>();
	const { mutate: register, isPending, error, isError } = useRegister();

	const onFinish = (values: RegisterFormValues) => {
		register(values);
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
					<div className={styles.cardHeader}>
						<div className={styles.cardTitle}>Tạo tài khoản</div>
						<Text className={styles.cardSubtitle}>
							Bắt đầu sử dụng Org AI Platform hoàn toàn miễn phí
						</Text>
					</div>

					{isError && error.message && (
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
							hoặc đăng ký bằng email
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
								placeholder="ban@congty.com"
								className={styles.input}
							/>
						</Form.Item>

						<Form.Item
							name="password"
							label="Mật khẩu"
							className={styles.formItem}
							rules={[
								{
									required: true,
									message: "Vui lòng tạo mật khẩu",
								},
								{
									min: 8,
									message: "Mật khẩu phải có ít nhất 8 ký tự",
								},
							]}
						>
							<Input.Password
								prefix={<LockOutlined />}
								placeholder="Tối thiểu 8 ký tự"
								className={`${styles.input} ${styles.passwordInput}`}
							/>
						</Form.Item>

						<Form.Item
							name="confirmPassword"
							label="Xác nhận mật khẩu"
							className={styles.formItem}
							dependencies={["password"]}
							rules={[
								{
									required: true,
									message: "Vui lòng xác nhận mật khẩu",
								},
								({ getFieldValue }) => ({
									validator(_, value) {
										if (
											!value ||
											getFieldValue("password") === value
										) {
											return Promise.resolve();
										}
										return Promise.reject(
											new Error("Mật khẩu không khớp")
										);
									},
								}),
							]}
						>
							<Input.Password
								prefix={<LockOutlined />}
								placeholder="Nhập lại mật khẩu"
								className={`${styles.input} ${styles.passwordInput}`}
							/>
						</Form.Item>

						<Form.Item
							name="terms"
							valuePropName="checked"
							rules={[
								{
									validator(_, value) {
										if (value) return Promise.resolve();
										return Promise.reject(
											new Error(
												"Bạn phải đồng ý với điều khoản để tiếp tục"
											)
										);
									},
								},
							]}
						>
							<Checkbox>
								<Text className={styles.termsText}>
									Tôi đồng ý với{" "}
									<Link href="#" className={styles.link}>
										Điều khoản dịch vụ
									</Link>{" "}
									và{" "}
									<Link href="#" className={styles.link}>
										Chính sách bảo mật
									</Link>
								</Text>
							</Checkbox>
						</Form.Item>

						<Form.Item style={{ marginBottom: 0 }}>
							<Button
								type="primary"
								htmlType="submit"
								className={styles.submitBtn}
								loading={isPending}
							>
								Tạo tài khoản
							</Button>
						</Form.Item>
					</Form>
				</div>

				{/* Footer */}
				<div className={styles.footer}>
					Đã có tài khoản?{" "}
					<Link href={AUTH_ROUTES.LOGIN} className={styles.link}>
						Đăng nhập
					</Link>
				</div>
			</div>
		</div>
	);
};

export default RegisterPage;
