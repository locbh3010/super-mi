"use client";

import { createStyles } from "antd-style";

export const useNotificationPopoverStyles = createStyles(({ token, css }) => ({
	// ─── Trigger ──────────────────────────────────────────────────────
	triggerBtn: css`
		font-size: 18px;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
	`,
	badge: css`
		.ant-badge-count {
			box-shadow: none;
		}
	`,

	// ─── Popover overlay ─────────────────────────────────────────────
	popoverOverlay: css`
		.ant-popover-inner {
			padding: 0;
			border-radius: ${token.borderRadiusLG}px;
			box-shadow:
				0 6px 16px 0 rgba(0, 0, 0, 0.08),
				0 3px 6px -4px rgba(0, 0, 0, 0.12),
				0 9px 28px 8px rgba(0, 0, 0, 0.05);
		}
	`,

	// ─── Container ───────────────────────────────────────────────────
	popoverContainer: css`
		max-width: 100vw;
	`,

	// ─── Header ──────────────────────────────────────────────────────
	popoverHeader: css`
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px 0;
	`,
	popoverTitle: css`
		font-size: 15px;
	`,
	markAllReadBtn: css`
		font-size: 12px;
		padding: 0;
		height: auto;
	`,

	// ─── Divider ─────────────────────────────────────────────────────
	divider: css`
		margin: 8px 0;
	`,

	// ─── Scroll area ─────────────────────────────────────────────────
	scrollArea: css`
		padding-right: 4px;
	`,

	// ─── Notification list ───────────────────────────────────────────
	list: css`
		padding: 0 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	`,

	// ─── Notification item ───────────────────────────────────────────
	notificationItem: css`
		display: flex;
		gap: 10px;
		padding: 10px 8px;
		border-radius: ${token.borderRadius}px;
		cursor: pointer;
		transition: background 0.2s;

		&:hover {
			background: ${token.colorFillQuaternary};
		}
	`,
	notificationItemUnread: css`
		display: flex;
		gap: 10px;
		padding: 10px 8px;
		border-radius: ${token.borderRadius}px;
		cursor: pointer;
		background: ${token.colorPrimaryBg};
		transition: background 0.2s;

		&:hover {
			background: ${token.colorPrimaryBgHover};
		}
	`,

	// ─── Item dot ────────────────────────────────────────────────────
	itemDot: css`
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: ${token.colorPrimary};
		flex-shrink: 0;
		margin-top: 6px;
	`,
	itemDotRead: css`
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: transparent;
		flex-shrink: 0;
		margin-top: 6px;
	`,

	// ─── Item content ────────────────────────────────────────────────
	itemContent: css`
		display: flex;
		flex-direction: column;
		gap: 3px;
		flex: 1;
		min-width: 0;
	`,
	itemTitle: css`
		font-size: 13px;
		line-height: 1.4;
	`,
	itemMessage: css`
		font-size: 12px;
		color: ${token.colorTextSecondary};
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	`,
	itemTime: css`
		font-size: 11px;
	`,

	// ─── Footer ──────────────────────────────────────────────────────
	popoverFooter: css`
		text-align: center;
		padding: 0 0 4px;
	`,
}));
