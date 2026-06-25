import { projectMembersQueryOptions } from "@/features/project/query-options";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "ahooks";
import { useMemo } from "react";

type Params = {
	projectId: string;
	page: number;
	limit: number;
	search?: string;
};

export const useProjectMembersTab = ({
	projectId,
	page,
	limit,
	search,
}: Params) => {
	const debouncedSearch = useDebounce(search, { wait: 400 });

	const params = useMemo(
		() => ({
			projectId,
			page,
			limit,
			search: debouncedSearch || undefined,
		}),
		[projectId, page, limit, debouncedSearch]
	);

	const {
		data: members,
		isPending,
		isLoading,
		isFetching,
	} = useQuery(projectMembersQueryOptions(params));

	const isLoadingMembers = isPending || isLoading || isFetching;

	return {
		members,
		isLoadingMembers,
	};
};
