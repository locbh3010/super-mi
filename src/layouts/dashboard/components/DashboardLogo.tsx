"use client";

import React from "react";
import { Typography } from "antd";
import { RobotOutlined } from "@ant-design/icons";
import { useLogoStyles } from "../styles";
import type { DashboardLogoProps } from "../types";

const { Text } = Typography;

const DashboardLogo: React.FC<DashboardLogoProps> = ({ collapsed }) => {
	const { styles, cx } = useLogoStyles();

	return (
		<div
			className={cx(
				styles.wrapper,
				collapsed ? styles.wrapperCollapsed : styles.wrapperExpanded
			)}
		>
			<div className={styles.icon}>
				<RobotOutlined />
			</div>

			{!collapsed && (
				<div className={styles.textWrapper}>
					<Text strong className={styles.appName}>
						OrgAI
					</Text>
					<Text type="secondary" className={styles.tagline}>
						Nền tảng doanh nghiệp
					</Text>
				</div>
			)}
		</div>
	);
};

export default DashboardLogo;
