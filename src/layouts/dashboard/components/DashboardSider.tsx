"use client";

import { Drawer } from "antd";
import Sider from "antd/es/layout/Sider";
import React from "react";
import { SIDER_COLLAPSED_WIDTH, SIDER_WIDTH } from "../constants";
import type { DashboardSiderProps } from "../types";
import { useSiderStyles } from "../styles";
import DashboardSidebarContent from "./DashboardSidebarContent";

const DashboardSider: React.FC<DashboardSiderProps> = ({
	collapsed,
	selectedKeys,
	openKeys,
	onOpenChange,
	drawerOpen,
	onCloseDrawer,
}) => {
	const { styles } = useSiderStyles();

	// Desktop: classic inline collapsible Sider.
	return (
		<>
			<Sider
				width={SIDER_WIDTH}
				collapsedWidth={SIDER_COLLAPSED_WIDTH}
				collapsed={collapsed}
				className={styles.sider}
				theme="light"
			>
				<DashboardSidebarContent
					collapsed={collapsed}
					selectedKeys={selectedKeys}
					openKeys={openKeys}
					onOpenChange={onOpenChange}
				/>
			</Sider>

			<Drawer
				placement="left"
				open={drawerOpen}
				onClose={onCloseDrawer}
				size={SIDER_WIDTH}
				closable={false}
				styles={{ body: { padding: 0 } }}
			>
				<DashboardSidebarContent
					collapsed={false}
					selectedKeys={selectedKeys}
					openKeys={openKeys}
					onOpenChange={onOpenChange}
					onMenuClick={onCloseDrawer}
				/>
			</Drawer>
		</>
	);
};

export default DashboardSider;
