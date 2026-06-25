"use client";

import { useQuery } from "@tanstack/react-query";
import { getLoggedUser } from "../services";

export const LOGGED_USER_QUERY_KEY = ["auth", "logged-user"] as const;

export function useFetchLoggedUser() {
	return useQuery({
		queryKey: LOGGED_USER_QUERY_KEY,
		queryFn: () => getLoggedUser(),
		staleTime: 5 * 60 * 1000,
	});
}
