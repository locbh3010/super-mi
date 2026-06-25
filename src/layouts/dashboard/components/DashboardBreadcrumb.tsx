"use client";

import { ROUTES } from "@/constants/routes";
import { useFetchProjectById } from "@/features/project/hooks/use-fetch-project-by-id";
import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumb, Typography } from "antd";
import React, { useMemo } from "react";
import { BREADCRUMB_MAP } from "../constants";
import { useBreadcrumbStyles } from "../styles";
import type { DashboardBreadcrumbProps } from "../types";

const { Text } = Typography;

const DashboardBreadcrumb: React.FC<DashboardBreadcrumbProps> = ({
	selectedKeys,
}) => {
	const { styles } = useBreadcrumbStyles();

	const currentKey = selectedKeys[0];

	// Phát hiện trang chi tiết dự án: /dashboard/projects/{id}
	const projectId = useMemo(() => {
		if (!currentKey?.startsWith(`${ROUTES.DASHBOARD.PROJECTS}/`)) return "";
		const id = currentKey.slice(ROUTES.DASHBOARD.PROJECTS.length + 1);
		// Loại trừ trường hợp còn segment con (vd: .../projects/{id}/edit).
		return id.includes("/") ? "" : id;
	}, [currentKey]);

	// Đọc tên dự án từ cache TanStack (đã dehydrate sẵn ở trang chi tiết).
	const { project } = useFetchProjectById(projectId);

	const breadcrumbItems = useMemo(() => {
		if (!currentKey) return [{ title: <HomeOutlined /> }];

		const segments = currentKey.split("/").filter(Boolean);
		const items: { title: React.ReactNode }[] = [
			{ title: <HomeOutlined /> },
		];

		let path = "";
		for (const segment of segments) {
			path += `/${segment}`;
			const label = BREADCRUMB_MAP[path];
			if (label) {
				items.push({ title: label });
			}
		}

		// Thêm crumb tên dự án ở trang chi tiết.
		if (projectId && project?.name) {
			items.push({ title: project.name });
		}

		return items;
	}, [currentKey, projectId, project]);

	const currentPageTitle = useMemo(() => {
		if (!currentKey) return "Tổng quan";

		if (projectId) return project?.name ?? "Dự án";

		return BREADCRUMB_MAP[currentKey] ?? "Trang";
	}, [currentKey, projectId, project]);

	return (
		<div className={styles.wrapper}>
			<Breadcrumb items={breadcrumbItems} className={styles.breadcrumb} />
			<Text strong className={styles.pageTitle}>
				{currentPageTitle}
			</Text>
		</div>
	);
};

export default DashboardBreadcrumb;
