"use client";

import { Layout } from "antd";
import React from "react";
import {
	DashboardBreadcrumb,
	DashboardHeader,
	DashboardSider,
} from "./components";
import useDashboardLayout from "./hooks/useDashboardLayout";
import { useLayoutStyles } from "./styles";
import type { DashboardLayoutProps } from "./types";
import { Content } from "antd/es/layout/layout";

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
	const { styles } = useLayoutStyles();
	const {
		collapsed,
		selectedKeys,
		openKeys,
		handleOpenChange,
		handleToggleCollapse,
		drawerOpen,
		closeDrawer,
	} = useDashboardLayout();

	return (
		<Layout hasSider className={styles.root}>
			<DashboardSider
				collapsed={collapsed}
				selectedKeys={selectedKeys}
				openKeys={openKeys}
				onOpenChange={handleOpenChange}
				drawerOpen={drawerOpen}
				onCloseDrawer={closeDrawer}
			/>

			<Layout>
				<DashboardHeader
					collapsed={collapsed}
					onToggleCollapse={handleToggleCollapse}
				/>

				<Content className={styles.content}>
					<DashboardBreadcrumb selectedKeys={selectedKeys} />
					<div className={styles.contentInner}>{children}</div>
				</Content>
			</Layout>
		</Layout>
	);
};

export default DashboardLayout;
