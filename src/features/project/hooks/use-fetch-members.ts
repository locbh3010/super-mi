"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useDebounceFn } from "ahooks";
import { useMemo, useState } from "react";

import { membersInfiniteQueryOptions } from "../query-options";

/**
 * Hook tải danh sách thành viên dạng infinite (scroll loadmore) cho ô chọn.
 * - `searchInput`: giá trị gõ tức thì; việc fetch theo search được debounce.
 * - `members`: flatten toàn bộ item đã load.
 * - `onPopupScroll`: gọi `fetchNextPage` khi cuộn gần đáy dropdown.
 */
export function useInfiniteFetchMembers(projectId?: string) {
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");

	const { run: debouncedSetSearch } = useDebounceFn(
		(value: string) => setSearch(value),
		{ wait: 400 }
	);

	const onSearch = (value: string) => {
		setSearchInput(value);
		debouncedSetSearch(value);
	};

	const query = useInfiniteQuery(
		membersInfiniteQueryOptions(search, projectId)
	);

	const members = useMemo(
		() => query.data?.pages.flatMap(page => page.items) ?? [],
		[query.data]
	);

	const onPopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const target = e.currentTarget;
		const reachedBottom =
			target.scrollTop + target.offsetHeight >= target.scrollHeight - 32;

		if (reachedBottom && query.hasNextPage && !query.isFetchingNextPage) {
			query.fetchNextPage();
		}
	};

	return {
		members,
		searchInput,
		onSearch,
		onPopupScroll,
		isLoading: query.isLoading,
		isFetchingNextPage: query.isFetchingNextPage,
		hasNextPage: query.hasNextPage,
		fetchNextPage: query.fetchNextPage,
	};
}
