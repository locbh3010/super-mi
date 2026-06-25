import React from "react";
import Link from "next/link";
import { DashboardOutlined, ProjectOutlined } from "@ant-design/icons";
import { ROUTES } from "@/constants/routes";
import type { MenuItem } from "./types";

const { DASHBOARD: D } = ROUTES;

/** Mục lá — nhãn bao bọc trong Next.js Link để điều hướng phía client */
function linkItem(
	label: React.ReactNode,
	key: string,
	icon?: React.ReactNode
): MenuItem {
	return {
		key: key || "#",
		icon,
		label: (
			<Link data-slot="next/link" href={key}>
				{label}
			</Link>
		),
	} as MenuItem;
}

export const MENU_ITEMS: MenuItem[] = [
	linkItem("Tổng quan", D.ROOT, <DashboardOutlined />),
	linkItem("Dự án", D.PROJECTS, <ProjectOutlined />),
];

export const SIDER_WIDTH = 256;
export const SIDER_COLLAPSED_WIDTH = 64;

export const BREADCRUMB_MAP: Record<string, string> = {
	[D.ROOT]: "Tổng quan",
	[D.PROJECTS]: "Dự án",
};
