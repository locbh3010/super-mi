import { SupabaseClient } from "@supabase/supabase-js";

// ==========================================
// 1. TYPE DEFINITIONS & DISCRIMINATED UNIONS
// ==========================================

// Cho phép key là các cột của bảng (keyof T) HOẶC một chuỗi bất kỳ (cho custom filter/join table)
export type FilterKey<T> = Extract<keyof T, string> | (string & {});

// Nhóm 1: So sánh bằng/khác (Nhận value đa dạng)
export interface EqualFilter<T> {
	key: FilterKey<T>;
	operator: "equal" | "not_equal";
	value: string | number | boolean | null;
}

// Nhóm 2: So sánh lớn/bé (Value là number hoặc string cho ngày tháng)
export interface NumericFilter<T> {
	key: FilterKey<T>;
	operator:
		| "less_than"
		| "greater_than"
		| "less_than_or_equal"
		| "greater_than_or_equal";
	value: number | string;
}

// Nhóm 3: Nằm trong mảng (Value là mảng)
export interface ArrayFilter<T> {
	key: FilterKey<T>;
	operator: "in" | "not_in";
	value: (string | number)[];
}

// Nhóm 4: Toán tử Logic (Không có key/value, BẮT BUỘC có subFilters)
export interface LogicalFilter<T> {
	operator: "or" | "and";
	subFilters: QueryFilter<T>[];
}

// Union Type gộp tất cả các filter
export type QueryFilter<T> =
	| EqualFilter<T>
	| NumericFilter<T>
	| ArrayFilter<T>
	| LogicalFilter<T>;

export interface AdvancedFetchOptions<T> {
	select?: string; // Mặc định: '*'
	search?: string;
	searchField?: FilterKey<T>[];
	orders?: Partial<Record<FilterKey<T>, boolean>>; // { [key]: true (desc) | false (asc) }
	page?: number; // Mặc định: 1
	limit?: number; // Mặc định: 10
	isCount?: boolean; // True = chỉ trả về count
	isAll?: boolean; // True = bỏ qua phân trang
	filters?: QueryFilter<T>[];
	isSingle?: boolean;

	// Hook để gắn thêm logic phức tạp (RPC, filter trên bảng join...)
	extendQuery?: (query: any) => any;
}

export interface FetchResult<T> {
	data: T[] | null;
	count: number | null;
	totalPages: number | null;
	error: any;
}

// ==========================================
// 2. UTILITY FUNCTIONS
// ==========================================

/**
 * Hàm đệ quy để build chuỗi PostgREST cho các toán tử OR / AND lồng nhau
 */
export const buildPostgrestString = <T>(f: QueryFilter<T>): string | null => {
	if (f.operator === "or" || f.operator === "and") {
		if (!f.subFilters || f.subFilters.length === 0) return null;
		const subStr = f.subFilters
			.map(buildPostgrestString)
			.filter(Boolean)
			.join(",");
		return `${f.operator}(${subStr})`;
	}

	const opMap: Record<string, string> = {
		equal: "eq",
		not_equal: "neq",
		less_than: "lt",
		greater_than: "gt",
		less_than_or_equal: "lte",
		greater_than_or_equal: "gte",
	};

	if (f.operator === "in") return `${f.key}.in.(${f.value.join(",")})`;
	if (f.operator === "not_in")
		return `${f.key}.not.in.(${f.value.join(",")})`;

	const op = opMap[f.operator];
	return `${(f as any).key}.${op}.${(f as any).value}`;
};

// ==========================================
// 3. MAIN HELPER FUNCTION
// ==========================================

/**
 * Helper hỗ trợ fetch list từ Supabase với Type-Safe filter, search, sort và pagination.
 */
export async function fetchList<T = any>(
	supabase: SupabaseClient,
	tableName: string,
	options: AdvancedFetchOptions<T>
): Promise<FetchResult<T>> {
	const {
		select = "*",
		search,
		searchField,
		orders,
		page = 1,
		limit = 10,
		isCount = false,
		isAll = false,
		filters = [],
		extendQuery,
	} = options;

	// 1. Khởi tạo Query
	let query: any = supabase
		.from(tableName)
		.select(select, { count: "exact", head: isCount });

	// 2. Áp dụng Filters
	filters.forEach(f => {
		if (f.operator === "or") {
			const innerStr = f.subFilters
				.map(buildPostgrestString)
				.filter(Boolean)
				.join(",");
			if (innerStr) query = query.or(innerStr);
		} else if (f.operator === "and") {
			const innerStr = f.subFilters
				.map(buildPostgrestString)
				.filter(Boolean)
				.join(",");
			if (innerStr) query = query.filter("", "and", innerStr as any);
		} else {
			// Nhờ Discriminated Unions, tới đây f chắc chắn có key và value
			const { key, value, operator } = f as any;

			switch (operator) {
				case "equal":
					query = query.eq(key, value);
					break;
				case "not_equal":
					query = query.neq(key, value);
					break;
				case "less_than":
					query = query.lt(key, value);
					break;
				case "greater_than":
					query = query.gt(key, value);
					break;
				case "less_than_or_equal":
					query = query.lte(key, value);
					break;
				case "greater_than_or_equal":
					query = query.gte(key, value);
					break;
				case "in":
					query = query.in(key, value);
					break;
				case "not_in":
					query = query.not(key, "in", value);
					break;
			}
		}
	});

	// 3. Áp dụng Search (Toàn cục)
	if (search && searchField && searchField.length > 0) {
		const searchConditions = searchField
			.map(field => `${String(field)}.ilike.%${search}%`)
			.join(",");
		query = query.or(searchConditions);
	}

	// 4. Áp dụng Custom Query Extension (Hook)
	if (extendQuery) {
		query = extendQuery(query);
	}

	// 5. Áp dụng Orders (Sắp xếp)
	if (orders) {
		Object.entries(orders).forEach(([key, isDesc]) => {
			query = query.order(key, { ascending: !isDesc });
		});
	}

	// 6. Áp dụng Phân trang (Pagination)
	if (!isAll && !isCount) {
		const p = Math.max(1, page);
		const l = Math.max(0, limit);
		const from = (p - 1) * l;
		const to = from + l - 1;
		query = query.range(from, to);
	}

	if (options.isSingle) query = query.single();

	// 7. Thực thi & Trả kết quả
	const { data, count, error } = await query;
	const totalPages =
		count && limit && !isAll ? Math.ceil(count / limit) : null;

	return {
		data: data as T[],
		count,
		totalPages,
		error,
	};
}
