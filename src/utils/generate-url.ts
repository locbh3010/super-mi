import qs from "qs";

type ExtractParams<T extends string> =
	T extends `${string}$${infer Param}/${infer Rest}`
		? { [K in Param | keyof ExtractParams<Rest>]: string }
		: T extends `${string}$${infer Param}`
			? { [K in Param]: string }
			: never;

type GenerateUrlOptions<Path extends string> =
	ExtractParams<Path> extends never
		? {
				params?: never;
				queries?: Record<string, unknown>;
			}
		: {
				params: ExtractParams<Path>;
				queries?: Record<string, unknown>;
			};

export function generateUrl<Path extends string>(
	pathname: Path,
	options?: GenerateUrlOptions<Path>
): string {
	let url = pathname as string;

	if (options?.params) {
		const params = options.params as Record<string, string>;
		for (const key of Object.keys(params)) {
			url = url.replace(`$${key}`, encodeURIComponent(params[key]));
		}
	}

	if (options?.queries && Object.keys(options.queries).length > 0) {
		const queryString = qs.stringify(options.queries, {
			addQueryPrefix: true,
			arrayFormat: "brackets",
			encodeValuesOnly: true,
		});
		url += queryString;
	}

	return url;
}
