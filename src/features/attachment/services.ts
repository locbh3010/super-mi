"use server";

import { createServiceClient } from "@/configs/supabase-service";
import type { TablesInsert } from "@/types/database";

import { deleteObject, uploadImage, uploadObject } from "./r2";
import {
	AttachmentUseFor,
	type Attachment,
	type CreateAttachmentPayload,
	type CreateRawAttachmentPayload,
	type DeleteAttachmentResult,
	type DeleteAttachmentsByTargetResult,
} from "./types";
import { getLoggedUser } from "../auth/services";

/**
 * Build R2 path (thư mục) theo user + loại đối tượng + target.
 * Eg: user_1/project/p_1, user_1/avatar/u_1, user_1/task/t_1
 */
export async function buildPath(
	uploaderId: string,
	useFor: AttachmentUseFor,
	targetId: string
) {
	return `${uploaderId}/${useFor}/${targetId}`.replace(/^\/+|\/+$/g, "");
}

/**
 * Ghép path (thư mục) + filename -> key đầy đủ trên R2.
 */
function buildKey(path: string, filename: string) {
	return `${path.replace(/\/+$/g, "")}/${filename}`;
}

/**
 * Map row DB (cột `userFor`) -> kiểu `Attachment` (field `useFor`).
 */
function toAttachment(
	row: Awaited<ReturnType<typeof createServiceClient>> extends never
		? never
		: Record<string, unknown>
): Attachment {
	return {
		...(row as Attachment),
		useFor: (row as { userFor: string }).userFor as AttachmentUseFor,
	};
}

/**
 * Lấy id user đang đăng nhập.
 */
async function getCurrentUserId() {
	const supabase = createServiceClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return user?.id ?? null;
}

/**
 * Upload ảnh lên R2 (tự convert sang .webp) rồi lưu metadata vào bảng `attachments`.
 *
 * - `path` lưu trong DB là thư mục: `${uploaderId}/${useFor}/${targetId}`
 * - `filename` lưu trong DB là tên object trên R2 (vd: `1718000000000.webp`)
 * - Key đầy đủ trên R2 = `${path}/${filename}`
 */
export async function createAttachment(
	payload: CreateAttachmentPayload
): Promise<Attachment> {
	const supabase = createServiceClient();
	const user = await getLoggedUser();

	const uploaderId = payload.uploaderId ?? user?.id;
	if (!uploaderId) {
		throw new Error("Bạn cần đăng nhập để tải tệp lên.");
	}

	const path =
		payload.path ??
		(await buildPath(uploaderId, payload.useFor, payload.targetId));
	const { key, url } = await uploadImage(path, payload.file);

	// filename = tên object trên R2 (phần sau path), không phải tên file gốc.
	const filename = key.slice(path.length + 1);

	const insert: TablesInsert<"attachments"> = {
		filename,
		path,
		url,
		target_id: payload.targetId,
		uploader_id: uploaderId,
		userFor: payload.useFor,
	};

	const { data, error } = await supabase
		.from("attachments")
		.insert(insert)
		.select("*")
		.single();

	if (error) {
		// Gọi callback để caller rollback tài nguyên trước.
		await payload.onError?.(new Error(error.message));
		// Rollback object trên R2 nếu insert DB thất bại.
		await deleteObject(key).catch(() => undefined);
		throw new Error(error.message);
	}

	return toAttachment(data);
}

/**
 * Upload tệp bất kỳ (không convert webp) lên R2 rồi lưu metadata.
 * - `path` lưu trong DB là thư mục: `${uploaderId}/${useFor}/${targetId}`
 * - `filename` lưu trong DB là tên object trên R2 (đảm bảo duy nhất bằng timestamp)
 */
export async function createRawAttachment(
	payload: CreateRawAttachmentPayload
): Promise<Attachment> {
	const supabase = createServiceClient();

	const uploaderId = payload.uploaderId ?? (await getCurrentUserId());
	if (!uploaderId) {
		throw new Error("Bạn cần đăng nhập để tải tệp lên.");
	}

	const raw =
		payload.file instanceof File
			? Buffer.from(await payload.file.arrayBuffer())
			: Buffer.isBuffer(payload.file)
				? payload.file
				: Buffer.from(payload.file);

	const originalName =
		payload.filename ??
		(payload.file instanceof File ? payload.file.name : "");

	// filename = tên object trên R2, gắn timestamp để tránh trùng.
	const filename = originalName
		? `${Date.now()}-${originalName}`
		: `${Date.now()}`;

	const path = await buildPath(uploaderId, payload.useFor, payload.targetId);
	const key = buildKey(path, filename);

	const { url } = await uploadObject(key, raw, payload.contentType);

	const insert: TablesInsert<"attachments"> = {
		filename,
		path,
		url,
		target_id: payload.targetId,
		uploader_id: uploaderId,
		userFor: payload.useFor,
	};

	const { data, error } = await supabase
		.from("attachments")
		.insert(insert)
		.select("*")
		.single();

	if (error) {
		await deleteObject(key).catch(() => undefined);
		throw new Error(error.message);
	}

	return toAttachment(data);
}

/**
 * Lấy danh sách attachment theo target (+ lọc theo loại nếu cần).
 */
export async function getAttachments(
	targetId: string,
	useFor?: AttachmentUseFor
): Promise<Attachment[]> {
	const supabase = createServiceClient();

	let query = supabase
		.from("attachments")
		.select("*")
		.eq("target_id", targetId)
		.order("created_at", { ascending: false });

	if (useFor) {
		query = query.eq("userFor", useFor);
	}

	const { data, error } = await query;

	if (error) {
		throw new Error(error.message);
	}

	return (data ?? []).map(toAttachment);
}

/**
 * Lấy 1 attachment theo id.
 */
export async function getAttachment(id: number): Promise<Attachment | null> {
	const supabase = createServiceClient();

	const { data, error } = await supabase
		.from("attachments")
		.select("*")
		.eq("id", id)
		.maybeSingle();

	if (error) {
		throw new Error(error.message);
	}

	return data ? toAttachment(data) : null;
}

/**
 * Xóa attachment: xóa object trên R2 + xóa row DB.
 */
export async function deleteAttachment(
	id: number
): Promise<DeleteAttachmentResult> {
	const supabase = createServiceClient();

	const { data: row, error: findError } = await supabase
		.from("attachments")
		.select("*")
		.eq("id", id)
		.maybeSingle();

	if (findError) {
		throw new Error(findError.message);
	}

	if (!row) {
		throw new Error("Không tìm thấy tệp đính kèm.");
	}

	await deleteObject(buildKey(row.path, row.filename));

	const { error } = await supabase.from("attachments").delete().eq("id", id);

	if (error) {
		throw new Error(error.message);
	}

	return { id };
}

/**
 * Xóa nhiều attachment theo danh sách ID (xóa R2 + DB cho từng attachment).
 */
export async function deleteAttachments(
	ids: number[]
): Promise<{ count: number }> {
	if (ids.length === 0) return { count: 0 };

	const supabase = createServiceClient();

	// Lấy metadata để biết path + filename cho R2.
	const { data: rows, error: findError } = await supabase
		.from("attachments")
		.select("*")
		.in("id", ids);

	if (findError) {
		throw new Error(findError.message);
	}

	// Xóa object trên R2 trước (fire-and-forget, không rollback nếu lỗi R2).
	await Promise.all(
		(rows ?? []).map(row =>
			deleteObject(buildKey(row.path, row.filename)).catch(
				() => undefined
			)
		)
	);

	// Xóa row DB.
	const { error } = await supabase.from("attachments").delete().in("id", ids);

	if (error) {
		throw new Error(error.message);
	}

	return { count: rows?.length ?? 0 };
}

export async function deleteAttachmentsByTarget(
	targetId: string,
	useFor?: AttachmentUseFor
): Promise<DeleteAttachmentsByTargetResult> {
	const rows = await getAttachments(targetId, useFor);

	await Promise.all(
		rows.map(row =>
			deleteObject(buildKey(row.path, row.filename)).catch(
				() => undefined
			)
		)
	);

	const supabase = createServiceClient();
	let query = supabase.from("attachments").delete().eq("target_id", targetId);

	if (useFor) {
		query = query.eq("userFor", useFor);
	}

	const { error } = await query;

	if (error) {
		throw new Error(error.message);
	}

	return { count: rows.length };
}
