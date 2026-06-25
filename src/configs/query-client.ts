import {
	defaultShouldDehydrateQuery,
	isServer,
	QueryClient,
} from "@tanstack/react-query";

function normalizeError(error: unknown): any {
	if (
		error &&
		typeof error === "object" &&
		"message" in error &&
		"statusCode" in error
	) {
		return error as any;
	}

	if (error instanceof Error) {
		return {
			message: error.message || "Đã xảy ra lỗi không xác định.",
			raw: error,
		};
	}

	return {
		message: "Đã xảy ra lỗi không xác định.",
		raw: error,
	};
}

function createQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retryDelay: 1000, // 1 second
				retryOnMount: true,
				refetchOnMount: true,
				refetchOnWindowFocus: true,
				refetchOnReconnect: true, // refetch on reconnect
				retry: 2,
				// placeholderData: keepPreviousData,
				gcTime: 1000 * 60 * 5, // 5 minutes
				staleTime: 1000 * 60 * 5, // 5 minutes
				throwOnError: false,
			},
			mutations: {
				onError(error) {
					return normalizeError(error);
				},
				retry: false,
			},
			dehydrate: {
				shouldDehydrateQuery: query =>
					defaultShouldDehydrateQuery(query) ||
					query.state.status === "pending",

				shouldRedactErrors: () => {
					return false;
				},
			},
		},
	});
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
	if (isServer) return createQueryClient();
	else {
		if (!browserQueryClient) browserQueryClient = createQueryClient();
		return browserQueryClient;
	}
}
