"use client";

import { useFetchLoggedUser } from "@/features/auth/hooks/use-fetch-logged-user";
import { useLogout } from "@/features/auth/hooks/use-logout";
import {
	LogoutOutlined,
	MenuFoldOutlined,
	MenuUnfoldOutlined,
	SettingOutlined,
	UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Avatar, Button, Dropdown, Typography } from "antd";
import { Header } from "antd/es/layout/layout";
import React from "react";
import { NotificationPopover } from "@/features/notifications/components";
import { useHeaderStyles } from "../styles";
import type { DashboardHeaderProps } from "../types";
import { head, split } from "lodash-es";

const { Text } = Typography;

const userMenuItems: MenuProps["items"] = [
	{ key: "profile", icon: <UserOutlined />, label: "Hồ sơ của tôi" },
	{ key: "settings", icon: <SettingOutlined />, label: "Cài đặt tài khoản" },
	{ type: "divider" },
	{
		key: "logout",
		icon: <LogoutOutlined />,
		label: "Đăng xuất",
		danger: true,
	},
];

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
	collapsed,
	onToggleCollapse,
}) => {
	const { styles } = useHeaderStyles();
	const { mutate: logout } = useLogout();
	const { data: user, isLoading } = useFetchLoggedUser();

	return (
		<Header className={styles.header}>
			<Button
				type="text"
				icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
				onClick={onToggleCollapse}
				className={styles.collapseBtn}
			/>

			<div className={styles.spacer} />

			{/* Notification */}
			<NotificationPopover />

			{/* User avatar */}
			<Dropdown
				menu={{
					items: userMenuItems,
					onClick: info => {
						if (info.key === "logout") {
							logout();
						}
					},
				}}
				trigger={["click"]}
				placement="bottomRight"
				arrow
			>
				<div className={styles.userTrigger} data-url={user?.avatar_url}>
					<Avatar
						size={32}
						className={styles.avatar}
						src={
							user?.avatar_url ? (
								<img
									src={user.avatar_url}
									alt={user?.display_name ?? "avatar"}
									referrerPolicy="no-referrer"
								/>
							) : undefined
						}
					>
						{head(split(user?.display_name, ''))}
					</Avatar>
					<div className={styles.userInfo}>
						<Text strong className={styles.userName}>
							{isLoading ? "Đang tải..." : user?.display_name}
						</Text>
						<Text type="secondary" className={styles.userEmail}>
							{user?.email}
						</Text>
					</div>
				</div>
			</Dropdown>
		</Header>
	);
};

export default DashboardHeader;
