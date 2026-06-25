import type { Editor } from "@tiptap/react";

/** Mapping giữa blob URL và file gốc — để upload lên server sau. */
export interface ImageBlobMapping {
	blobUrl: string;
	file: File;
}

export interface RichEditorProps {
	/** HTML content (for controlled usage with Ant Design Form) */
	value?: string;
	/** Called with HTML string when content changes */
	onChange?: (value: string) => void;
	/** Placeholder text when editor is empty */
	placeholder?: string;
	/** Called each time an image is inserted (blob URL + File). Caller lưu lại để upload sau. */
	onImageInsert?: (mapping: ImageBlobMapping) => void;
}

export interface ToolbarProps {
	editor: Editor | null;
	onImageInsert?: (mapping: ImageBlobMapping) => void;
}
