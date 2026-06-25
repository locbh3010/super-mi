"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebounceFn } from "ahooks";
import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs";
import { useState } from "react";
import {
	parseAsIndex,
	parseAsPageSize,
	parseAsSearch,
	parseAsSort,
} from "@/constants/parser";
import { projectsQueryOptions } from "../query-options";

export function useFetchProjects() {
	const [filters, setFilters] = useQueryStates({
		q: parseAsSearch,
		page: parseAsIndex(1),
		pageSize: parseAsPageSize,
		sort: parseAsSort,
		members: parseAsArrayOf(parseAsString).withDefault([]),
	});

	const { q: search, page, pageSize, sort, members } = filters;

	// Giá trị hiển thị tức thì trong ô input; việc cập nhật URL/query
	// được debounce để tránh fetch liên tục khi đang gõ.
	const [searchInput, setSearchInput] = useState(search ?? "");

	const { run: debouncedSetSearch } = useDebounceFn(
		(value: string) => {
			setFilters({ q: value || null, page: 1 });
		},
		{ wait: 400 }
	);

	const onSearchChange = (value: string) => {
		setSearchInput(value);
		debouncedSetSearch(value);
	};

	const onMembersChange = (value: string[]) => {
		setFilters({ members: value.length ? value : null, page: 1 });
	};

	const hasFilters = search !== null || members.length > 0;

	const resetFilters = () => {
		setSearchInput("");
		setFilters({ q: null, members: null, page: 1 });
	};

	const query = useQuery(
		projectsQueryOptions({
			page,
			limit: pageSize,
			search: search ?? undefined,
			sort: sort ? { field: sort.id, desc: sort.desc } : null,
			memberIds: members.length ? members : undefined,
		})
	);

	return {
		// filters
		filters,
		setFilters,
		resetFilters,
		hasFilters,
		search,
		searchInput,
		onSearchChange,
		members,
		onMembersChange,
		page,
		pageSize,
		sort,
		// data
		projects: query.data?.items ?? [],
		total: query.data?.total ?? 0,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}
