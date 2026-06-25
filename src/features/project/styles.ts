"use client";
import { createStyles } from "antd-style";

export const useProjectsPageStyles = createStyles(
	({ token, css, responsive }) => ({
		header: css`
			display: flex;
			align-items: flex-end;
			justify-content: flex-end;
			gap: 16px;
			margin-bottom: 20px;
			${responsive.mobile} {
				flex-direction: column;
				align-items: stretch;
			}
		`,
		titleWrap: css`
			display: flex;
			flex-direction: column;
			gap: 2px;
		`,
		title: css`
			margin: 0;
			font-size: 24px;
			font-weight: 700;
			color: ${token.colorTextHeading};
			letter-spacing: -0.02em;
		`,
		subtitle: css`
			margin: 0;
			color: ${token.colorTextSecondary};
			font-size: 13px;
		`,
		toolbarCard: css`
			margin-block: 12px;
		`,
		toolbar: css`
			${responsive.mobile} {
				flex-direction: column;
				align-items: stretch;
				gap: 12px;
			}
		`,
		search: css`
			flex: 1 1 240px;
			min-width: 200px;
			max-width: 250px;
			${responsive.mobile} {
				flex: 1 1 100%;
				max-width: 100%;
			}
		`,
		filter: css`
			flex: 0 0 auto;
			min-width: 200px;
			max-width: 240px;
			${responsive.mobile} {
				width: 100%;
				max-width: 100%;
			}
		`,
		tableCard: css`
			background: ${token.colorBgContainer};
			border: 1px solid ${token.colorBorderSecondary};
			border-radius: ${token.borderRadiusLG}px;
			box-shadow: ${token.boxShadowTertiary};
			overflow: hidden;
			.ant-table-thead > tr > th {
				background: ${token.colorFillQuaternary};
				font-weight: 600;
				white-space: nowrap;
			}

			.ant-table-row > td {
				cursor: pointer;
			}
		`,
		thumb: css`
			width: 56px;
			height: 56px;
			border-radius: ${token.borderRadius}px;
			object-fit: cover;
			display: block;
			border: 1px solid ${token.colorBorderSecondary};
		`,
		thumbFallback: css`
			width: 56px;
			height: 56px;
			border-radius: ${token.borderRadius}px;
			display: flex;
			align-items: center;
			justify-content: center;
			background: ${token.colorFillSecondary};
			color: ${token.colorTextQuaternary};
			font-size: 20px;
		`,
		nameCell: css`
			display: flex;
			flex-direction: column;
			gap: 2px;
		`,
		nameText: css`
			font-weight: 600;
			color: ${token.colorText};
		`,
		descText: css`
			color: ${token.colorTextSecondary};
			font-size: 12px;
			display: -webkit-box;
			-webkit-line-clamp: 1;
			-webkit-box-orient: vertical;
			overflow: hidden;
			max-width: 260px;
		`,
		progressCell: css`
			min-width: 120px;
			max-width: 160px;
		`,
		drawerForm: css`
			.ant-upload-list-item-container,
			.ant-upload.ant-upload-select {
				width: 104px !important;
				height: 104px !important;
			}
		`,
		uploadHint: css`
			color: ${token.colorTextTertiary};
			font-size: 12px;
			margin-top: 4px;
		`,
	})
);

export const useProjectDetailStyles = createStyles(
	({ token, css, responsive }) => ({
		projectName: css`
			margin: 0;
		`,
		page: css`
			display: flex;
			flex-direction: column;
			gap: 16px;
		`,
		tabsCard: css`
			.ant-card-body {
				padding: ${token.padding}px ${token.paddingLG}px
					${token.paddingLG}px;
			}
			${responsive.mobile} {
				.ant-card-body {
					padding: ${token.paddingSM}px;
				}
			}
		`,
		toolbar: css`
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 12px;
			margin-bottom: 16px;
			flex-wrap: wrap;
			${responsive.mobile} {
				flex-direction: column;
				align-items: center;
			}
		`,
		search: css`
			min-width: 200px;
			max-width: 320px;
			${responsive.mobile} {
				max-width: 100%;
			}
		`,
		toolbarRight: css`
			display: flex;
			align-items: center;
			gap: 8px;
			flex-wrap: wrap;
			${responsive.mobile} {
				justify-content: flex-end;
				width: 100%;
			}
		`,
		/* Grid view */
		grid: css`
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 16px;
			${responsive.tablet} {
				grid-template-columns: repeat(2, minmax(0, 1fr));
			}
			${responsive.mobile} {
				grid-template-columns: 1fr;
			}
		`,
		taskCard: css`
			border: 1px solid ${token.colorBorderSecondary};
			border-radius: ${token.borderRadiusLG}px;
			transition: all 0.2s ease;
			cursor: pointer;
			&:hover {
				border-color: ${token.colorPrimaryBorderHover};
				box-shadow: ${token.boxShadowTertiary};
			}
			.ant-card-body {
				padding: ${token.padding}px;
			}
		`,
		taskCardHead: css`
			display: flex;
			align-items: flex-start;
			justify-content: space-between;
			gap: 8px;
			margin-bottom: 8px;
		`,
		taskTitle: css`
			margin: 0;
			font-weight: 600;
			font-size: 14px;
			color: ${token.colorText};
		`,
		taskDesc: css`
			color: ${token.colorTextSecondary};
			font-size: 12px;
			margin: 0 0 12px;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
		`,
		taskFooter: css`
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 8px;
			margin-top: 12px;
		`,
		taskMeta: css`
			display: flex;
			align-items: center;
			gap: 6px;
			color: ${token.colorTextTertiary};
			font-size: 12px;
		`,
		/* Kanban view */
		kanban: css`
			display: flex;
			gap: 16px;
			align-items: flex-start;
			overflow-x: auto;
			padding-bottom: 8px;
		`,
		kanbanColumn: css`
			flex: 1 1 0;
			min-width: 280px;
			background: ${token.colorFillQuaternary};
			border-radius: ${token.borderRadiusLG}px;
			padding: 12px;
			display: flex;
			flex-direction: column;
			gap: 12px;
		`,
		kanbanColumnHead: css`
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 8px;
			padding: 0 4px;
		`,
		kanbanColumnTitle: css`
			display: flex;
			align-items: center;
			gap: 8px;
			font-weight: 600;
			font-size: 13px;
			color: ${token.colorText};
		`,
		kanbanDot: css`
			width: 8px;
			height: 8px;
			border-radius: 50%;
			flex: 0 0 auto;
		`,
		kanbanList: css`
			display: flex;
			flex-direction: column;
			gap: 10px;
		`,
		kanbanCard: css`
			background: ${token.colorBgContainer};
			border: 1px solid ${token.colorBorderSecondary};
			border-radius: ${token.borderRadius}px;
			padding: 12px;
			cursor: grab;
			transition:
				border-color 0.2s ease,
				box-shadow 0.2s ease;
			touch-action: none;
			&:hover {
				border-color: ${token.colorPrimaryBorderHover};
				box-shadow: ${token.boxShadowTertiary};
			}
			&:active {
				cursor: grabbing;
			}
		`,
		kanbanCardDragging: css`
			opacity: 0.4;
			border-style: dashed;
			border-color: ${token.colorPrimaryBorder};
		`,
		kanbanColumnOver: css`
			outline: 2px dashed ${token.colorPrimaryBorderHover};
			outline-offset: -2px;
		`,
		kanbanEmpty: css`
			padding: 12px;
			text-align: center;
			border: 1px dashed ${token.colorBorderSecondary};
			border-radius: ${token.borderRadius}px;
			color: ${token.colorTextTertiary};
			font-size: 12px;
		`,
		tableCard: css`
			border: 1px solid ${token.colorBorderSecondary};
			border-radius: ${token.borderRadiusLG}px;
			overflow: hidden;
			.ant-table-thead > tr > th {
				background: ${token.colorFillQuaternary};
				font-weight: 600;
				white-space: nowrap;
			}
		`,
		/* Settings */
		settingsTabs: css`
			.ant-tabs-content-holder {
				padding-left: 24px;
			}
			${responsive.mobile} {
				.ant-tabs-content-holder {
					padding-left: 0;
					padding-top: 16px;
				}
			}
		`,
		settingsSection: css`
			max-width: 640px;
		`,
		settingsSectionTitle: css`
			margin: 0 0 4px;
			font-size: 16px;
			font-weight: 600;
			color: ${token.colorTextHeading};
		`,
		settingsSectionDesc: css`
			margin: 0 0 20px;
			color: ${token.colorTextSecondary};
			font-size: 13px;
		`,
		settingRow: css`
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16px;
			padding: 16px 0;
			border-bottom: 1px solid ${token.colorBorderSecondary};
			&:last-child {
				border-bottom: none;
			}
		`,
		settingRowInfo: css`
			display: flex;
			flex-direction: column;
			gap: 2px;
			min-width: 0;
		`,
		settingRowTitle: css`
			font-weight: 500;
			color: ${token.colorText};
			font-size: 14px;
		`,
		settingRowDesc: css`
			color: ${token.colorTextTertiary};
			font-size: 12px;
		`,
		dangerZone: css`
			border: 1px solid ${token.colorErrorBorder};
			border-radius: ${token.borderRadiusLG}px;
			padding: 16px;
			margin-top: 24px;
			background: ${token.colorErrorBg};
		`,
	})
);
