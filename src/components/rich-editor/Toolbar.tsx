"use client";

import { useRef, useState } from "react";
import { Popover } from "antd";
import {
	BoldOutlined,
	ItalicOutlined,
	UnderlineOutlined,
	StrikethroughOutlined,
	AlignLeftOutlined,
	AlignCenterOutlined,
	AlignRightOutlined,
	LinkOutlined,
	PictureOutlined,
	OrderedListOutlined,
	UnorderedListOutlined,
	TableOutlined,
	CodeOutlined,
	BlockOutlined,
	FontColorsOutlined,
	BgColorsOutlined,
	ClearOutlined,
	MinusOutlined,
	VerticalAlignBottomOutlined,
	VerticalAlignTopOutlined,
	LineOutlined,
} from "@ant-design/icons";
import { useRichEditorStyles } from "./styles";
import { TEXT_COLORS, HIGHLIGHT_COLORS } from "./constants";
import type { ToolbarProps } from "./types";

function HeadingSelect({
	editor,
}: {
	editor: NonNullable<ToolbarProps["editor"]>;
}) {
	const { styles } = useRichEditorStyles();

	const currentHeading = [1, 2, 3].find(l =>
		editor.isActive("heading", { level: l }),
	);

	return (
		<select
			className={styles.toolbarSelect}
			value={currentHeading ? `h${currentHeading}` : "p"}
			onChange={e => {
				const v = e.target.value;
				if (v === "p") {
					editor.chain().focus().setParagraph().run();
				} else {
					const level = parseInt(v.replace("h", ""), 10) as 1 | 2 | 3;
					editor.chain().focus().toggleHeading({ level }).run();
				}
			}}
		>
			<option value="p">Đoạn văn</option>
			<option value="h1">Heading 1</option>
			<option value="h2">Heading 2</option>
			<option value="h3">Heading 3</option>
		</select>
	);
}

function ToolbarButton({
	icon,
	title,
	isActive,
	onClick,
	disabled,
}: {
	icon: React.ReactNode;
	title: string;
	isActive: boolean;
	onClick: () => void;
	disabled?: boolean;
}) {
	const { styles } = useRichEditorStyles();

	return (
		<button
			type="button"
			className={`${styles.toolbarBtn} ${isActive ? "active" : ""}`}
			title={title}
			onClick={onClick}
			disabled={disabled}
		>
			{icon}
		</button>
	);
}

function Divider() {
	const { styles } = useRichEditorStyles();
	return <span className={styles.toolbarDivider} />;
}

/** Popover content: color palette + custom color input */
function TextColorPalette({
	editor,
	onPick,
}: {
	editor: NonNullable<ToolbarProps["editor"]>;
	onPick: () => void;
}) {
	const { styles } = useRichEditorStyles();

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 180 }}>
			<div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
				{TEXT_COLORS.map(c => (
					<span
						key={c}
						className={styles.colorSwatch}
						style={{ background: c, width: 24, height: 24 }}
						onClick={() => {
							editor.chain().focus().setColor(c).run();
							onPick();
						}}
					/>
				))}
			</div>
			<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
				<input
					type="color"
					className={styles.colorInput}
					value="#000000"
					onInput={e => {
						editor.chain().focus().setColor(e.currentTarget.value).run();
					}}
					title="Màu tuỳ chỉnh"
				/>
				<span style={{ fontSize: 12, color: "#999" }}>Tuỳ chỉnh</span>
			</div>
			<ToolbarButton
				icon={<ClearOutlined />}
				title="Xoá màu chữ"
				isActive={false}
				onClick={() => {
					editor.chain().focus().unsetColor().run();
					onPick();
				}}
			/>
		</div>
	);
}

function HighlightPalette({
	editor,
	onPick,
}: {
	editor: NonNullable<ToolbarProps["editor"]>;
	onPick: () => void;
}) {
	const { styles } = useRichEditorStyles();

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 180 }}>
			<div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
				{HIGHLIGHT_COLORS.map(c => (
					<span
						key={c}
						className={styles.colorSwatch}
						style={{
							background: c === "transparent" ? "#f0f0f0" : c,
							width: 24,
							height: 24,
							border: c === "transparent" ? "2px dashed #d9d9d9" : undefined,
						}}
						onClick={() => {
							if (c === "transparent") {
								editor.chain().focus().unsetHighlight().run();
							} else {
								editor.chain().focus().toggleHighlight({ color: c }).run();
							}
							onPick();
						}}
					/>
				))}
			</div>
		</div>
	);
}

export function RichEditorToolbar({ editor, onImageInsert }: ToolbarProps) {
	const { styles } = useRichEditorStyles();
	const [textColorOpen, setTextColorOpen] = useState(false);
	const [highlightOpen, setHighlightOpen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	if (!editor) return null;

	const addLink = () => {
		const previousUrl = editor.getAttributes("link").href as string | undefined;
		const url = window.prompt("Nhập URL:", previousUrl ?? "https://");
		if (url === null) return;
		if (url === "") {
			editor.chain().focus().extendMarkRange("link").unsetLink().run();
			return;
		}
		editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
	};

	const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) return;
		if (file.size > 10 * 1024 * 1024) return;

		const blobUrl = URL.createObjectURL(file);
		editor.chain().focus().setImage({ src: blobUrl }).run();
		onImageInsert?.({ blobUrl, file });

		// Reset input để chọn lại cùng file
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const openFilePicker = () => {
		fileInputRef.current?.click();
	};

	const addTable = () => {
		editor
			.chain()
			.focus()
			.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
			.run();
	};

	const hasTextColor = editor.isActive("textStyle");

	return (
		<div className={styles.toolbar}>
			{/* Heading select */}
			<HeadingSelect editor={editor} />
			<Divider />

			{/* Text formatting */}
			<ToolbarButton
				icon={<BoldOutlined />}
				title="In đậm (Ctrl+B)"
				isActive={editor.isActive("bold")}
				onClick={() => editor.chain().focus().toggleBold().run()}
			/>
			<ToolbarButton
				icon={<ItalicOutlined />}
				title="In nghiêng (Ctrl+I)"
				isActive={editor.isActive("italic")}
				onClick={() => editor.chain().focus().toggleItalic().run()}
			/>
			<ToolbarButton
				icon={<UnderlineOutlined />}
				title="Gạch chân (Ctrl+U)"
				isActive={editor.isActive("underline")}
				onClick={() => editor.chain().focus().toggleUnderline().run()}
			/>
			<ToolbarButton
				icon={<StrikethroughOutlined />}
				title="Gạch ngang"
				isActive={editor.isActive("strike")}
				onClick={() => editor.chain().focus().toggleStrike().run()}
			/>
			<ToolbarButton
				icon={<CodeOutlined />}
				title="Code inline"
				isActive={editor.isActive("code")}
				onClick={() => editor.chain().focus().toggleCode().run()}
			/>
			<Divider />

			{/* Text color popover */}
			<Popover
				content={
					<TextColorPalette
						editor={editor}
						onPick={() => setTextColorOpen(false)}
					/>
				}
				trigger="click"
				open={textColorOpen}
				onOpenChange={setTextColorOpen}
				placement="bottomLeft"
			>
				<button
					type="button"
					className={`${styles.toolbarBtn} ${hasTextColor ? "active" : ""}`}
					title="Màu chữ"
				>
					<FontColorsOutlined />
				</button>
			</Popover>

			{/* Highlight popover */}
			<Popover
				content={
					<HighlightPalette
						editor={editor}
						onPick={() => setHighlightOpen(false)}
					/>
				}
				trigger="click"
				open={highlightOpen}
				onOpenChange={setHighlightOpen}
				placement="bottomLeft"
			>
				<button
					type="button"
					className={`${styles.toolbarBtn} ${editor.isActive("highlight") ? "active" : ""}`}
					title="Tô màu nền"
				>
					<BgColorsOutlined />
				</button>
			</Popover>
			<Divider />

			{/* Alignment */}
			<ToolbarButton
				icon={<AlignLeftOutlined />}
				title="Căn trái"
				isActive={editor.isActive({ textAlign: "left" })}
				onClick={() => editor.chain().focus().setTextAlign("left").run()}
			/>
			<ToolbarButton
				icon={<AlignCenterOutlined />}
				title="Căn giữa"
				isActive={editor.isActive({ textAlign: "center" })}
				onClick={() => editor.chain().focus().setTextAlign("center").run()}
			/>
			<ToolbarButton
				icon={<AlignRightOutlined />}
				title="Căn phải"
				isActive={editor.isActive({ textAlign: "right" })}
				onClick={() => editor.chain().focus().setTextAlign("right").run()}
			/>
			<ToolbarButton
				icon={<LineOutlined />}
				title="Căn đều"
				isActive={editor.isActive({ textAlign: "justify" })}
				onClick={() => editor.chain().focus().setTextAlign("justify").run()}
			/>
			<Divider />

			{/* Lists */}
			<ToolbarButton
				icon={<UnorderedListOutlined />}
				title="Danh sách"
				isActive={editor.isActive("bulletList")}
				onClick={() => editor.chain().focus().toggleBulletList().run()}
			/>
			<ToolbarButton
				icon={<OrderedListOutlined />}
				title="Danh sách có thứ tự"
				isActive={editor.isActive("orderedList")}
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
			/>
			<Divider />

			{/* Blocks */}
			<ToolbarButton
				icon={<BlockOutlined />}
				title="Trích dẫn"
				isActive={editor.isActive("blockquote")}
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
			/>
			<ToolbarButton
				icon={<CodeOutlined />}
				title="Khối code"
				isActive={editor.isActive("codeBlock")}
				onClick={() => editor.chain().focus().toggleCodeBlock().run()}
			/>
			<ToolbarButton
				icon={<MinusOutlined />}
				title="Đường kẻ ngang"
				isActive={false}
				onClick={() => editor.chain().focus().setHorizontalRule().run()}
			/>
			<Divider />

			{/* Insert */}
			<ToolbarButton
				icon={<LinkOutlined />}
				title="Chèn link"
				isActive={editor.isActive("link")}
				onClick={addLink}
			/>
			<ToolbarButton
				icon={<PictureOutlined />}
				title="Chèn ảnh"
				isActive={false}
				onClick={openFilePicker}
			/>
			<ToolbarButton
				icon={<TableOutlined />}
				title="Chèn bảng"
				isActive={editor.isActive("table")}
				onClick={addTable}
			/>
			<Divider />

			{/* Sub / Superscript */}
			<ToolbarButton
				icon={<VerticalAlignBottomOutlined />}
				title="Subscript"
				isActive={editor.isActive("subscript")}
				onClick={() => editor.chain().focus().toggleSubscript().run()}
			/>
			<ToolbarButton
				icon={<VerticalAlignTopOutlined />}
				title="Superscript"
				isActive={editor.isActive("superscript")}
				onClick={() => editor.chain().focus().toggleSuperscript().run()}
			/>
			<Divider />

			{/* Clear formatting */}
			<ToolbarButton
				icon={<ClearOutlined />}
				title="Xoá định dạng"
				isActive={false}
				onClick={() =>
					editor.chain().focus().clearNodes().unsetAllMarks().run()
				}
			/>
				{/* Hidden file input for image upload */}
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					style={{ display: "none" }}
					onChange={handleImagePick}
				/>
		</div>
	);
}
