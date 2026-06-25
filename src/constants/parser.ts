import { createParser, parseAsStringLiteral } from "nuqs";

/**
 * Search parser: trims + lowercases the query.
 * Empty/whitespace-only strings serialize away (null) so they disappear from the URL.
 *
 * Eg: /?q=%20Hello%20 -> "hello"
 *     /?q= -> null (key removed)
 */
export const parseAsSearch = createParser<string>({
	parse(query) {
		const normalized = query.trim().toLowerCase();
		return normalized === "" ? null : normalized;
	},
	serialize(value) {
		const normalized = value.trim().toLowerCase();
		return normalized;
	},
	eq(a, b) {
		return a.trim().toLowerCase() === b.trim().toLowerCase();
	},
});

export type SortValue = {
	id: string;
	desc: boolean;
};

/**
 * Sort parser for TanStack-style sorting state.
 *
 * Eg: /?sort=name:asc  -> { id: "name", desc: false }
 *     /?sort=name:desc -> { id: "name", desc: true }
 */
export const parseAsSort = createParser<SortValue>({
	parse(query) {
		const [key = "", direction = ""] = query.split(":");
		if (key === "") return null;
		const desc =
			parseAsStringLiteral(["asc", "desc"]).parse(direction) ?? "asc";
		return { id: key, desc: desc === "desc" };
	},
	serialize(value) {
		return `${value.id}:${value.desc ? "desc" : "asc"}`;
	},
	eq(a, b) {
		return a.id === b.id && a.desc === b.desc;
	},
});

/**
 * Index/page-number parser: accepts only positive integers (>= the given min).
 * Anything else (NaN, negatives, decimals, below min) falls back to `defaultValue`.
 *
 * Eg: parseAsIndex(1) -> /?page=3 => 3, /?page=0 => 1, /?page=abc => 1
 */
export function parseAsIndex(defaultValue = 1) {
	const min = defaultValue;
	return createParser<number>({
		parse(query) {
			const n = Number(query);
			if (!Number.isInteger(n) || n < min) return null;
			return n;
		},
		serialize(value) {
			return String(value);
		},
		eq(a, b) {
			return a === b;
		},
	}).withDefault(defaultValue);
}

export const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50, 70, 100] as const;

export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

/**
 * Page-size parser: only allows the whitelisted page sizes.
 * Any other value falls back to the default (10).
 *
 * Eg: /?pageSize=20 => 20, /?pageSize=25 => 10, /?pageSize=foo => 10
 */
export const parseAsPageSize = createParser<PageSize>({
	parse(query) {
		const n = Number(query);
		return PAGE_SIZE_OPTIONS.includes(n as PageSize)
			? (n as PageSize)
			: null;
	},
	serialize(value) {
		return String(value);
	},
	eq(a, b) {
		return a === b;
	},
}).withDefault(10);
