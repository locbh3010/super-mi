"use client";
import { createStyles } from "antd-style";

export const useRichEditorStyles = createStyles(({ token, css }) => ({
	wrapper: css`
		border: 1px solid ${token.colorBorder};
		border-radius: ${token.borderRadius}px;
		overflow: hidden;
		background: ${token.colorBgContainer};
		transition: border-color 0.2s;
		&:focus-within {
			border-color: ${token.colorPrimary};
		}
	`,

	toolbar: css`
		display: flex;
		align-items: center;
		gap: 2px;
		padding: 6px 8px;
		border-bottom: 1px solid ${token.colorBorderSecondary};
		background: ${token.colorFillQuaternary};
		flex-wrap: wrap;
		position: sticky;
		top: 0;
		z-index: 10;
	`,

	toolbarDivider: css`
		width: 1px;
		height: 20px;
		background: ${token.colorBorderSecondary};
		margin: 0 4px;
		flex-shrink: 0;
	`,

	toolbarBtn: css`
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 28px;
		border: none;
		border-radius: ${token.borderRadiusSM}px;
		background: transparent;
		color: ${token.colorTextSecondary};
		cursor: pointer;
		font-size: 14px;
		padding: 0;
		transition: all 0.15s;
		flex-shrink: 0;

		&:hover {
			background: ${token.colorFillSecondary};
			color: ${token.colorText};
		}

		&.active {
			background: ${token.colorPrimaryBg};
			color: ${token.colorPrimary};
		}

		&:disabled {
			opacity: 0.35;
			cursor: not-allowed;
		}
	`,

	toolbarSelect: css`
		height: 28px;
		border: 1px solid ${token.colorBorderSecondary};
		border-radius: ${token.borderRadiusSM}px;
		background: ${token.colorBgContainer};
		color: ${token.colorTextSecondary};
		font-size: 12px;
		padding: 0 4px;
		cursor: pointer;
		outline: none;
		flex-shrink: 0;

		&:focus {
			border-color: ${token.colorPrimaryBorder};
		}
	`,

	colorInput: css`
		width: 24px;
		height: 24px;
		border: 1px solid ${token.colorBorderSecondary};
		border-radius: 4px;
		padding: 0;
		cursor: pointer;
		background: none;
		flex-shrink: 0;

		&::-webkit-color-swatch-wrapper {
			padding: 2px;
		}
		&::-webkit-color-swatch {
			border: none;
			border-radius: 3px;
		}
	`,

	colorPalette: css`
		display: flex;
		align-items: center;
		gap: 2px;
	`,

	colorSwatch: css`
		width: 18px;
		height: 18px;
		border-radius: 3px;
		border: 1px solid ${token.colorBorderSecondary};
		cursor: pointer;
		flex-shrink: 0;
		transition: transform 0.1s;
		&:hover {
			transform: scale(1.25);
			z-index: 1;
		}
	`,

	editorContent: css`
		padding: 12px 16px;
		min-height: 200px;
		max-height: 420px;
		overflow-y: auto;
		outline: none;
		font-size: 14px;
		line-height: 1.7;
		color: ${token.colorText};

		/* Tiptap Placeholder */
		.tiptap p.is-editor-empty:first-child::before {
			color: ${token.colorTextQuaternary};
			content: attr(data-placeholder);
			float: left;
			height: 0;
			pointer-events: none;
		}

		/* Headings */
		h1 {
			font-size: 1.6em;
			font-weight: 700;
			margin: 0.67em 0;
			line-height: 1.3;
		}
		h2 {
			font-size: 1.35em;
			font-weight: 600;
			margin: 0.6em 0;
			line-height: 1.35;
		}
		h3 {
			font-size: 1.15em;
			font-weight: 600;
			margin: 0.55em 0;
			line-height: 1.4;
		}

		/* Paragraph spacing */
		p {
			margin: 0;
			line-height: 1.2;
		}

		/* Lists */
		ul,
		ol {
			padding-left: 1.5em;
			margin: 0.4em 0;
		}
		li {
			margin: 0.15em 0;
		}

		/* Blockquote */
		blockquote {
			border-left: 3px solid ${token.colorPrimaryBorder};
			padding-left: 12px;
			margin: 0.6em 0;
			color: ${token.colorTextSecondary};
			font-style: italic;
		}

		/* Code */
		code {
			background: ${token.colorFillSecondary};
			border-radius: ${token.borderRadiusSM}px;
			padding: 0.15em 0.4em;
			font-size: 0.9em;
			font-family: ${token.fontFamilyCode ?? "monospace"};
		}

		pre {
			background: ${token.colorFillTertiary};
			border-radius: ${token.borderRadius}px;
			padding: 12px 16px;
			margin: 0.6em 0;
			overflow-x: auto;

			code {
				background: none;
				padding: 0;
				font-size: 0.88em;
				line-height: 1.6;
			}
		}

		/* Horizontal rule */
		hr {
			border: none;
			border-top: 1px solid ${token.colorBorderSecondary};
			margin: 1em 0;
		}

		/* Links */
		a {
			color: ${token.colorPrimary};
			text-decoration: underline;
			cursor: pointer;

			&:hover {
				color: ${token.colorPrimaryActive};
			}
		}

		/* Images */
		img {
			max-width: 100%;
			height: auto;
			border-radius: ${token.borderRadiusSM}px;
			margin: 0.4em 0;

			&.ProseMirror-selectednode {
				outline: 2px solid ${token.colorPrimary};
				outline-offset: 2px;
			}
		}

		/* Tables */
		table {
			border-collapse: collapse;
			table-layout: fixed;
			width: 100%;
			margin: 0.6em 0;
			overflow: hidden;

			td,
			th {
				border: 1px solid ${token.colorBorderSecondary};
				padding: 8px 12px;
				vertical-align: top;
				min-width: 60px;
				position: relative;
			}

			th {
				background: ${token.colorFillQuaternary};
				font-weight: 600;
				text-align: left;
			}

			.selectedCell {
				background: ${token.colorPrimaryBg};
			}
		}

		/* Highlight / text color markers */
		mark {
			border-radius: 2px;
			padding: 0 2px;
		}

		/* Subscript / Superscript */
		sub {
			font-size: 0.8em;
			vertical-align: sub;
		}
		sup {
			font-size: 0.8em;
			vertical-align: super;
		}

		/* Strikethrough */
		s {
			text-decoration: line-through;
		}

		/* ProseMirror overrides */
		.ProseMirror {
			outline: none;
			min-height: 180px;

			&:focus {
				outline: none;
			}
		}

		/* Text alignment */
		[style*="text-align: center"] {
			text-align: center;
		}
		[style*="text-align: right"] {
			text-align: right;
		}
		[style*="text-align: justify"] {
			text-align: justify;
		}
	`,
}));
