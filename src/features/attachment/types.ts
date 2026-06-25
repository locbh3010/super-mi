import { Tables } from "@/types/database";

export enum AttachmentUseFor {
	PROJECT = "project",
	AVATAR = "avatar",
	TASK = "task",
}

export type Attachment = Tables<"attachments"> & {
	useFor: AttachmentUseFor;
};

export interface CreateAttachmentPayload {
	/** File ảnh cần upload. */
	file: File | Buffer | Uint8Array;
	/** Loại đối tượng đính kèm (project, avatar, task). */
	useFor: AttachmentUseFor;
	/** ID của đối tượng đính kèm. */
	targetId: string;
	/** Tên file gốc (tùy chọn). */
	filename?: string;
	/** ID người upload (mặc định lấy user đang đăng nhập). */
	uploaderId?: string;
	/** Override thư mục R2 (bỏ qua buildPath mặc định). Eg: `${userId}/projects/${projectId}/tasks/${taskId}`. */
	path?: string;
	/** Callback khi có lỗi (trước khi throw), để caller rollback tài nguyên. */
	onError?: (error: Error) => Promise<void> | void;
}

export interface CreateRawAttachmentPayload extends CreateAttachmentPayload {
	/** MIME type của tệp (tùy chọn). */
	contentType?: string;
}

export interface DeleteAttachmentResult {
	id: number;
}

export interface DeleteAttachmentsByTargetResult {
	count: number;
}
