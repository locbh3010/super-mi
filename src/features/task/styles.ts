"use client";
import { createStyles } from "antd-style";

export const useTaskStyles = createStyles(({ token, css }) => ({
	toolbar: css`
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 16px;
		flex-wrap: wrap;
	`,
	search: css`
		flex: 1 1 240px;
		min-width: 200px;
		max-width: 320px;
	`,
	toolbarRight: css`
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
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
	/* Kanban */
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
	kanbanColumnOver: css`
		outline: 2px dashed ${token.colorPrimaryBorderHover};
		outline-offset: -2px;
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
	kanbanEmpty: css`
		padding: 12px;
		text-align: center;
		border: 1px dashed ${token.colorBorderSecondary};
		border-radius: ${token.borderRadius}px;
		color: ${token.colorTextTertiary};
		font-size: 12px;
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
	taskMeta: css`
		display: flex;
		align-items: center;
		gap: 6px;
		color: ${token.colorTextTertiary};
		font-size: 12px;
	`,
}));
