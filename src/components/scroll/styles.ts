import { createStyles } from "antd-style";

export const useScrollStyles = createStyles(({ token, css }) => ({
	root: css`
		overflow: hidden;
	`,

	viewport: css`
		width: 100%;
		height: 100%;
		border-radius: inherit;

		/* ensure children of the viewport fill its full size */
		> div {
			display: block !important;
		}
	`,

	scrollbar: css`
		display: flex;
		user-select: none;
		touch-action: none;
		padding: 2px;
		background: transparent;
		transition:
			background 160ms ease-out,
			opacity 160ms ease-out;

		&:hover {
			background: ${token.colorFillSecondary};
		}

		&[data-orientation="vertical"] {
			width: 8px;
		}

		&[data-orientation="horizontal"] {
			flex-direction: column;
			height: 8px;
		}

		&[data-state="hidden"] {
			opacity: 0;
		}
	`,

	thumb: css`
		flex: 1;
		border-radius: ${token.borderRadiusSM}px;
		background: ${token.colorTextQuaternary};
		position: relative;
		transition: background 160ms ease-out;

		&:hover {
			background: ${token.colorTextTertiary};
		}
	`,

	corner: css`
		background: transparent;
	`,
}));
