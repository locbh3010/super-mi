import type { MenuProps } from "antd";

export type MenuItem = Required<MenuProps>["items"][number];

export interface DashboardLayoutProps {
	children: React.ReactNode;
}

export interface DashboardSiderProps {
	collapsed: boolean;
	selectedKeys: string[];
	openKeys: string[];
	onOpenChange: (keys: string[]) => void;
	drawerOpen: boolean;
	onCloseDrawer: () => void;
}

export interface DashboardHeaderProps {
	collapsed: boolean;
	onToggleCollapse: () => void;
}

export interface DashboardBreadcrumbProps {
	selectedKeys: string[];
}

export interface DashboardLogoProps {
	collapsed: boolean;
}
