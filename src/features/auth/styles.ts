"use client";

import { createStyles } from "antd-style";

// ─── Shared Auth Layout ───────────────────────────────────────────────────────
export const useAuthLayoutStyles = createStyles(({ token, css }) => ({
	// Full-screen centered wrapper with ambient background
	root: css`
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px 16px;
		background: ${token.colorBgLayout};
		position: relative;
		overflow: hidden;

		/* Ambient glow blobs */
		&::before {
			content: "";
			position: fixed;
			top: -15%;
			left: -10%;
			width: 55%;
			height: 55%;
			border-radius: 50%;
			background: radial-gradient(
				circle,
				${token.colorPrimary}1a 0%,
				transparent 70%
			);
			pointer-events: none;
			animation: bgPulse 8s ease-in-out infinite alternate;
		}

		&::after {
			content: "";
			position: fixed;
			bottom: -15%;
			right: -10%;
			width: 50%;
			height: 50%;
			border-radius: 50%;
			background: radial-gradient(
				circle,
				${token.colorPrimaryActive}14 0%,
				transparent 70%
			);
			pointer-events: none;
			animation: bgPulse 10s ease-in-out infinite alternate-reverse;
		}

		@keyframes bgPulse {
			from {
				transform: scale(1);
				opacity: 0.6;
			}
			to {
				transform: scale(1.2);
				opacity: 1;
			}
		}
	`,

	// Centered content wrapper
	center: css`
		width: 100%;
		max-width: 440px;
		position: relative;
		z-index: 1;
	`,

	// Logo / brand header above the card
	brand: css`
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 28px;
	`,

	brandIcon: css`
		width: 52px;
		height: 52px;
		border-radius: 14px;
		background: linear-gradient(
			135deg,
			${token.colorPrimary},
			${token.colorPrimaryActive}
		);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 12px;
		box-shadow:
			0 8px 24px ${token.colorPrimary}44,
			0 0 0 1px ${token.colorPrimary}22;

		.anticon {
			font-size: 26px;
			color: #fff;
		}
	`,

	brandName: css`
		font-size: 15px;
		font-weight: 700;
		color: ${token.colorTextHeading};
		letter-spacing: 0.3px;
	`,

	// Card wrapper
	card: css`
		background: ${token.colorBgContainer};
		border: 1px solid ${token.colorBorderSecondary};
		border-radius: ${token.borderRadiusLG}px;
		padding: 40px 36px;
		box-shadow:
			0 4px 24px rgba(0, 0, 0, 0.28),
			0 1px 2px rgba(0, 0, 0, 0.12);

		@media (max-width: 480px) {
			padding: 28px 20px;
		}
	`,

	// Card header
	cardHeader: css`
		margin-bottom: 28px;
		text-align: center;
	`,

	cardTitle: css`
		font-size: 22px;
		font-weight: 700;
		color: ${token.colorTextHeading};
		margin-bottom: 6px;
		line-height: 1.3;
	`,

	cardSubtitle: css`
		font-size: 13px;
		color: ${token.colorTextSecondary};
		line-height: 1.6;
	`,

	// OAuth
	oauthBtn: css`
		height: 42px;
		border-radius: ${token.borderRadiusLG}px;
		font-weight: 500;
		font-size: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	`,

	dividerText: css`
		color: ${token.colorTextTertiary};
		font-size: 12px;
	`,

	// Form
	formItem: css`
		margin-bottom: 16px;

		.ant-form-item-label > label {
			width: 100%;
			font-size: 13px;
			font-weight: 500;
			color: ${token.colorText};
		}
	`,

	input: css`
		height: 42px;
		border-radius: ${token.borderRadiusLG}px;
		font-size: 14px;
	`,

	passwordInput: css`
		.ant-input {
			font-size: 14px;
		}
	`,

	submitBtn: css`
		height: 44px;
		border-radius: ${token.borderRadiusLG}px;
		font-size: 15px;
		font-weight: 600;
		width: 100%;
		background: linear-gradient(
			135deg,
			${token.colorPrimary},
			${token.colorPrimaryActive}
		);
		border: none;
		box-shadow: 0 4px 16px ${token.colorPrimary}55;
		transition:
			opacity 0.2s,
			box-shadow 0.2s,
			transform 0.15s;

		&:hover:not(:disabled) {
			opacity: 0.9;
			box-shadow: 0 6px 20px ${token.colorPrimary}66;
			transform: translateY(-1px);
		}

		&:active:not(:disabled) {
			transform: translateY(0);
		}
	`,

	// Footer links
	footer: css`
		margin-top: 20px;
		text-align: center;
		font-size: 13px;
		color: ${token.colorTextSecondary};
	`,

	link: css`
		color: ${token.colorPrimary};
		font-weight: 500;
		transition: opacity 0.2s;

		&:hover {
			opacity: 0.8;
			color: ${token.colorPrimary};
		}
	`,

	forgotLink: css`
		font-size: 12px;
		color: ${token.colorTextTertiary};
		transition: color 0.2s;

		&:hover {
			color: ${token.colorPrimary};
		}
	`,

	// Success state (forgot-password)
	successIcon: css`
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: linear-gradient(
			135deg,
			${token.colorSuccess}22,
			${token.colorSuccessBg}
		);
		border: 1px solid ${token.colorSuccessBorder};
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 20px;

		.anticon {
			font-size: 28px;
			color: ${token.colorSuccess};
		}
	`,

	// Terms checkbox
	termsText: css`
		font-size: 12px;
		color: ${token.colorTextSecondary};
		line-height: 1.6;
	`,
}));
