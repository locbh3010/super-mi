"use client";

import { useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useRichEditorStyles } from "./styles";
import { RichEditorToolbar } from "./Toolbar";
import type { RichEditorProps } from "./types";

const lowlight = createLowlight(common);

/** Debounce helper: delay ms then fire */
function useDebounce<T extends (...args: never[]) => void>(fn: T, delay: number) {
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const fnRef = useRef(fn);

	useEffect(() => {
		fnRef.current = fn;
	});

	return useCallback(
		(...args: Parameters<T>) => {
			clearTimeout(timer.current);
			timer.current = setTimeout(() => fnRef.current(...args), delay);
		},
		[delay],
	);
}

export function RichEditor({
	value,
	onChange,
	onImageInsert,
	placeholder = "Nhập nội dung...",
}: RichEditorProps) {
	const { styles } = useRichEditorStyles();
	// Guard: skip setContent when editor itself triggered the change
	const isInternalChange = useRef(false);

	const debouncedOnChange = useDebounce(
		(html: string) => {
			isInternalChange.current = true;
			onChange?.(html);
		},
		150,
	);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: { levels: [1, 2, 3] },
				codeBlock: false,
				link: {
					openOnClick: false,
					HTMLAttributes: {
						rel: "noopener noreferrer",
						target: "_blank",
					},
				},
			}),
			CodeBlockLowlight.configure({ lowlight }),
			ImageExtension.configure({
				inline: true,
				allowBase64: true,
			}),
			Table.configure({ resizable: true }),
			TableRow,
			TableHeader,
			TableCell,
			TextStyle,
			Color,
			Highlight.configure({ multicolor: true }),
			TextAlign.configure({ types: ["heading", "paragraph"] }),
			Subscript,
			Superscript,
			Placeholder.configure({ placeholder }),
		],
		content: value ?? "",
		onUpdate: ({ editor: ed }) => {
			debouncedOnChange(ed.getHTML());
		},
		editorProps: {
			attributes: {
				class: styles.editorContent,
			},
		},
		immediatelyRender: true,
	});

	// Sync external value changes → editor (skip if change from editor itself)
	useEffect(() => {
		if (!editor || editor.isDestroyed) return;
		if (isInternalChange.current) {
			isInternalChange.current = false;
			return;
		}
		const currentHTML = editor.getHTML();
		if (value !== undefined && value !== currentHTML) {
			editor.commands.setContent(value, { emitUpdate: false });
		}
	}, [value, editor]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (editor && !editor.isDestroyed) {
				editor.destroy();
			}
		};
	}, [editor]);

	return (
		<div className={styles.wrapper}>
			<RichEditorToolbar editor={editor} onImageInsert={onImageInsert} />
			<EditorContent editor={editor} />
		</div>
	);
}
