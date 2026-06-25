"use client";

import { Grid } from "antd";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

/**
 * All layout-level logic lives here so that UI components stay pure.
 */
const useDashboardLayout = () => {
	const pathname = usePathname();
	const [collapsed, setCollapsed] = useState(false);

	// `lg` is the desktop threshold; below it the sidebar becomes a Drawer.
	const screens = Grid.useBreakpoint();
	const isMobile = !screens.lg;
	const [drawerOpenMobile, setDrawerOpenMobile] = useState(false);
	// Drawer only visible on mobile; desktop always closed.
	const drawerOpen = isMobile ? drawerOpenMobile : false;

	const selectedKeys = useMemo(() => [pathname], [pathname]);

	// Derive which sub-menus should be open from the current path
	const defaultOpenKeys = useMemo(() => {
		const parts = pathname.split("/").filter(Boolean);
		const opens: string[] = [];

		if (
			parts.includes("fine-tuning") ||
			parts.includes("agents") ||
			parts.includes("models") ||
			parts.includes("knowledge")
		) {
			opens.push("ai-studio");
		}
		if (parts.includes("analytics")) {
			opens.push("analytics");
		}
		if (parts.includes("infra")) {
			opens.push("infrastructure");
		}
		if (parts.includes("admin")) {
			opens.push("admin");
		}
		// Nested: fine-tuning children
		if (parts.includes("fine-tuning") && parts.length > 2) {
			opens.push("/dashboard/fine-tuning");
		}
		if (parts.includes("agents") && parts.length > 2) {
			opens.push("/dashboard/agents");
		}
		if (parts.includes("knowledge") && parts.length > 2) {
			opens.push("/dashboard/knowledge");
		}

		return opens;
	}, [pathname]);

	const [openKeys, setOpenKeys] = useState<string[]>(defaultOpenKeys);

	const handleOpenChange = useCallback((keys: string[]) => {
		setOpenKeys(keys);
	}, []);

	const handleToggleCollapse = useCallback(() => {
		setCollapsed(prev => !prev);
	}, []);

	const closeDrawer = useCallback(() => setDrawerOpenMobile(false), []);

	// On mobile the toggle opens the overlay Drawer; on desktop it collapses.
	const handleToggle = useCallback(() => {
		if (isMobile) {
			setDrawerOpenMobile(prev => !prev);
		} else {
			handleToggleCollapse();
		}
	}, [isMobile, handleToggleCollapse]);

	return {
		collapsed,
		selectedKeys,
		openKeys,
		handleOpenChange,
		handleToggleCollapse: handleToggle,
		drawerOpen,
		closeDrawer,
	};
};

export default useDashboardLayout;
