"use server";

import {
	DeleteObjectCommand,
	DeleteObjectsCommand,
	GetObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";

import { ENV } from "@/constants/env";

const r2 = new S3Client({
	region: "auto",
	endpoint: ENV.S3_ENDPOINT,
	credentials: {
		accessKeyId: ENV.R2_ACCESS_KEY_ID,
		secretAccessKey: ENV.R2_SECRET_ACCESS_KEY,
	},
});

const publicUrl = (key: string) =>
	`${ENV.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;

export async function uploadObject(
	key: string,
	body: Buffer | Uint8Array | string,
	contentType?: string
) {
	await r2.send(
		new PutObjectCommand({
			Bucket: ENV.R2_BUCKET_NAME,
			Key: key,
			Body: body,
			ContentType: contentType,
		})
	);

	return { key, url: publicUrl(key) };
}

export async function deleteObject(key: string) {
	await r2.send(
		new DeleteObjectCommand({
			Bucket: ENV.R2_BUCKET_NAME,
			Key: key,
		})
	);

	return { key };
}

export async function getUploadUrl(
	key: string,
	contentType?: string,
	expiresIn = 3600
) {
	const url = await getSignedUrl(
		r2,
		new PutObjectCommand({
			Bucket: ENV.R2_BUCKET_NAME,
			Key: key,
			ContentType: contentType,
		}),
		{ expiresIn }
	);

	return { url, key, publicUrl: publicUrl(key) };
}

export async function getDownloadUrl(key: string, expiresIn = 3600) {
	const url = await getSignedUrl(
		r2,
		new GetObjectCommand({
			Bucket: ENV.R2_BUCKET_NAME,
			Key: key,
		}),
		{ expiresIn }
	);

	return { url, key };
}

/**
 * Chuyển ảnh sang định dạng .webp.
 */
export async function convertToWebp(input: Buffer | Uint8Array) {
	const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
	return sharp(buffer).webp({ quality: 80 }).toBuffer();
}

/**
 * Xóa toàn bộ object trong 1 thư mục (prefix) trên R2.
 * - List tất cả object có prefix `folderPath`.
 * - Xóa từng batch (tối đa 1000 object/lần) bằng DeleteObjectsCommand.
 */
export async function deleteFolder(folderPath: string) {
	const prefix = folderPath.replace(/\/+$/, "") + "/";

	let isTruncated = true;
	let continuationToken: string | undefined;
	let deletedCount = 0;

	while (isTruncated) {
		const listCmd: ListObjectsV2Command = new ListObjectsV2Command({
			Bucket: ENV.R2_BUCKET_NAME,
			Prefix: prefix,
			ContinuationToken: continuationToken,
		});

		const listRes = await r2.send(listCmd);

		const objects = listRes.Contents ?? [];
		if (objects.length > 0) {
			const deleteCmd = new DeleteObjectsCommand({
				Bucket: ENV.R2_BUCKET_NAME,
				Delete: {
					Objects: objects.map(obj => ({ Key: obj.Key! })),
					Quiet: true,
				},
			});

			await r2.send(deleteCmd);
			deletedCount += objects.length;
		}

		isTruncated = listRes.IsTruncated ?? false;
		continuationToken = listRes.NextContinuationToken;
	}

	return { deletedCount };
}

/**
 * Upload 1 ảnh lên R2:
 * - Tự động chuyển ảnh sang .webp
 * - Lưu theo path truyền vào (vd: `${userId}/projects/${projectId}`)
 *
 * Trả về `{ key, url }` với `url` là public URL.
 *
 * Eg: uploadImage(`${userId}/projects/${projectId}`, file)
 *     -> { key: "user_1/projects/p_1/1718000000000.webp", url: "https://cdn.../..." }
 */
export async function uploadImage(
	path: string,
	file: File | Buffer | Uint8Array
) {
	const raw =
		file instanceof File
			? Buffer.from(await file.arrayBuffer())
			: Buffer.isBuffer(file)
				? file
				: Buffer.from(file);

	const webp = await convertToWebp(raw);

	const dir = path.replace(/^\/+|\/+$/g, "");
	const key = `${dir}/${Date.now()}.webp`;

	return uploadObject(key, webp, "image/webp");
}
