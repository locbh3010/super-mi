"use client";

import { Menu } from "antd";
import React from "react";
import { MENU_ITEMS } from "../constants";
import { useSiderStyles } from "../styles";
import DashboardLogo from "./DashboardLogo";
import ScrollArea from "@/components/scroll/Scroll";

interface DashboardSidebarContentProps {
	collapsed: boolean;
	selectedKeys: string[];
	openKeys: string[];
	onOpenChange: (keys: string[]) => void;
	onMenuClick?: () => void;
}

/**
 * Sidebar inner content (logo + menu) shared by the desktop `Sider`
 * and the mobile `Drawer`, so both render identical navigation.
 */
const DashboardSidebarContent: React.FC<DashboardSidebarContentProps> = ({
	collapsed,
	selectedKeys,
	openKeys,
	onOpenChange,
	onMenuClick,
}) => {
	const { styles } = useSiderStyles();

	return (
		<>
			<DashboardLogo collapsed={collapsed} />
			<ScrollArea height="calc(100vh - 64px)">
				<Menu
					mode="inline"
					theme="light"
					selectedKeys={selectedKeys}
					openKeys={openKeys}
					onOpenChange={onOpenChange}
					onClick={onMenuClick}
					items={MENU_ITEMS}
					className={styles.menu}
				/>
			</ScrollArea>
		</>
	);
};

export default DashboardSidebarContent;
