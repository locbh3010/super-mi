import { unstable_cache } from "next/cache";

interface CacheOptions {
	revalidate?: number; // Thời gian cache (giây), mặc định 1 giờ
	tags?: string[]; // Tag để xóa cache, mặc định lấy phần tử đầu của queryKey
}

const DEFAULT_CACHE_TIME = 3600;

export function cacheQueryFn<T>(
	queryKey: any[],
	queryFn: () => Promise<T>,
	options?: CacheOptions
): () => Promise<T> {
	// 1. Nếu đang ở CLIENT: Trả về hàm gốc luôn, chạy CSR và dùng cache của TanStack
	if (typeof window !== "undefined") {
		return queryFn;
	}

	// 2. Nếu đang ở SERVER: Tự động hóa cấu hình Next.js Cache
	const entityName = queryKey[0]; // Lấy chữ 'products', 'categories', 'sliders'...

	// Tự sinh cache key độc nhất bằng cách stringify toàn bộ queryKey (bao gồm cả params)
	const derivedCacheKey = [entityName, JSON.stringify(queryKey)];

	// Tự sinh tag chuẩn hóa (Ví dụ: 'products', 'categories')
	const derivedTags = options?.tags || [entityName];

	return () =>
		unstable_cache(queryFn, derivedCacheKey, {
			revalidate: options?.revalidate ?? DEFAULT_CACHE_TIME, // 1 hour
			tags: derivedTags,
		})();
}
