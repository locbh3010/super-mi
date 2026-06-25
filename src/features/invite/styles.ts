import { createStyles } from "antd-style";

export const useReceiveInvitesStyles = createStyles(
	({ token, css }) => ({
		loading: css`
			display: flex;
			justify-content: center;
			padding: 48px 0;
		`,

		inviteItem: css`
			display: flex;
			gap: 16px;
			padding: 16px 0;
			border-bottom: 1px solid ${token.colorSplit};
		`,
		inviteItemLast: css`
			display: flex;
			gap: 16px;
			padding: 16px 0;
			border-bottom: none;
		`,

		thumbnail: css`
			width: 64px;
			height: 64px;
			border-radius: 8px;
			overflow: hidden;
			flex-shrink: 0;
			background-color: ${token.colorFillTertiary};
			display: flex;
			align-items: center;
			justify-content: center;
			position: relative;
			border: 1px solid ${token.colorBorderSecondary};
		`,
		thumbnailPlaceholder: css`
			font-size: 11px;
		`,

		info: css`
			flex: 1;
			min-width: 0;
			display: flex;
			flex-direction: column;
			gap: 8px;
		`,

		projectSection: css`
			display: flex;
			flex-direction: column;
			gap: 4px;
		`,

		nameRow: css`
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 8px;
		`,

		projectName: css`
			font-size: 15px;
			font-weight: 600;
			color: ${token.colorText};
		`,

		desc: css`
			margin: 0;
			font-size: 13px;
			color: ${token.colorTextDescription};
			line-height: 1.4;
		`,

		senderSection: css`
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 8px 12px;
			background-color: ${token.colorBgContainerDisabled};
			border-radius: 6px;
			border: 1px dashed ${token.colorBorder};
		`,
		senderAvatar: css`
			flex-shrink: 0;
		`,
		senderMeta: css`
			display: flex;
			flex-direction: column;
			min-width: 0;
		`,
		senderLabel: css`
			font-size: 11px;
			color: ${token.colorTextDescription};
		`,
		senderName: css`
			font-size: 13px;
			font-weight: 500;
			color: ${token.colorText};
		`,
		senderEmail: css`
			font-size: 11px;
			color: ${token.colorTextQuaternary};
		`,

		actions: css`
			display: flex;
			gap: 8px;
			justify-content: flex-end;
			margin-top: 4px;
		`,
	})
);
