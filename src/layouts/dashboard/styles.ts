"use client";

import { createStyles } from "antd-style";

// ─── DashboardLayout ─────────────────────────────────────────────────────────
export const useLayoutStyles = createStyles(({ token, css, responsive }) => ({
	root: css`
		min-height: 100vh;
	`,
	content: css`
		padding-bottom: 32px;
		background: ${token.colorBgLayout};
		min-height: calc(100vh - 64px);

		${responsive.mobile} {
			min-height: calc(100vh - 56px);
		}
	`,
	contentInner: css`
		padding: 16px 24px 0;

		${responsive.mobile} {
			padding: 12px 12px 0;
		}
	`,
}));

// ─── DashboardSider ──────────────────────────────────────────────────────────
export const useSiderStyles = createStyles(({ css, responsive }) => ({
	sider: css`
		overflow: hidden;
		height: 100vh;
		position: sticky;
		inset-inline-start: 0;
		top: 0;
		bottom: 0;
		box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
		z-index: 100;

		${responsive.tablet} {
			display: none !important;
		}
	`,
	menu: css`
		border-inline-end: none !important;
		padding-bottom: 24px;
	`,
}));

// ─── DashboardLogo ───────────────────────────────────────────────────────────
export const useLogoStyles = createStyles(({ token, css }) => ({
	wrapper: css`
		display: flex;
		align-items: center;
		gap: 10px;
		height: 64px;
		border-bottom: 1px solid ${token.colorBorderSecondary};
		overflow: hidden;
		transition: padding 0.2s;
		flex-shrink: 0;
	`,
	wrapperCollapsed: css`
		padding: 20px;
	`,
	wrapperExpanded: css`
		padding: 20px 24px;
	`,
	icon: css`
		width: 32px;
		height: 32px;
		border-radius: 8px;
		background: linear-gradient(
			135deg,
			${token.colorPrimary},
			${token.colorPrimaryActive}
		);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-shadow: 0 4px 12px ${token.colorPrimaryBg};

		.anticon {
			color: #fff;
			font-size: 18px;
		}
	`,
	textWrapper: css`
		overflow: hidden;
	`,
	appName: css`
		font-size: 15px;
		line-height: 1.2;
		display: block;
		white-space: nowrap;
	`,
	tagline: css`
		font-size: 11px;
		white-space: nowrap;
	`,
}));

// ─── DashboardHeader ─────────────────────────────────────────────────────────
export const useHeaderStyles = createStyles(({ token, css }) => ({
	header: css`
		padding: 0 24px;
		background: ${token.colorBgContainer};
		border-bottom: 1px solid ${token.colorBorderSecondary};
		display: flex;
		align-items: center;
		gap: 12px;
		position: sticky;
		top: 0;
		z-index: 99;
		height: 64px;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

		@media (max-width: 991px) {
			padding: 0 12px;
			height: 56px;
			line-height: 56px;
		}
	`,
	collapseBtn: css`
		font-size: 16px;
		width: 40px;
		height: 40px;
	`,
	spacer: css`
		flex: 1;
	`,
	userTrigger: css`
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		padding: 4px 8px;
		border-radius: 8px;
		transition: background 0.2s;

		&:hover {
			background: ${token.colorFillSecondary};
		}
	`,
	avatar: css`
		background: linear-gradient(
			135deg,
			${token.colorPrimary},
			${token.colorPrimaryActive}
		);
		flex-shrink: 0;
	`,
	userInfo: css`
		display: flex;
		flex-direction: column;

		@media (max-width: 575px) {
			display: none;
		}
	`,
	userName: css`
		font-size: 13px;
		line-height: 1.3;
	`,
	userEmail: css`
		font-size: 11px;
	`,
}));

// ─── DashboardBreadcrumb ─────────────────────────────────────────────────────
export const useBreadcrumbStyles = createStyles(
	({ token, css, responsive }) => ({
		wrapper: css`
			padding: 16px 24px 0;
			display: flex;
			flex-direction: column;
			gap: 4px;

			${responsive.mobile} {
				padding: 12px 12px 0;
			}
		`,
		breadcrumb: css`
			font-size: 12px;
		`,
		pageTitle: css`
			font-size: 22px;
			line-height: 1.3;
			color: ${token.colorTextHeading};
			text-transform: capitalize;
		`,
	})
);
