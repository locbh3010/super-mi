"use server";

import { cookies } from "next/headers";

/**
 * Options for setting cookies.
 * Compatible with Next.js ResponseCookie options.
 */
export type CookieOptions = Partial<{
	path: string;
	domain: string;
	maxAge: number;
	expires: Date | number;
	secure: boolean;
	httpOnly: boolean;
	sameSite: boolean | "lax" | "strict" | "none";
	priority: "low" | "medium" | "high";
}>;

/**
 * Get the value of a cookie by name on the server.
 * @param name The name of the cookie to retrieve.
 * @returns The string value of the cookie, or undefined if not found.
 */
export async function getCookie(
	name: string
): Promise<{ value: string | undefined } | undefined> {
	const cookieStore = await cookies();
	return cookieStore.get(name);
}

/**
 * Check if a cookie exists on the server.
 * @param name The name of the cookie to check.
 * @returns True if the cookie exists, false otherwise.
 */
export async function hasCookie(name: string): Promise<boolean> {
	const cookieStore = await cookies();
	return cookieStore.has(name);
}

/**
 * Set/Create a cookie on the server.
 * Note: This can only be called in Server Actions or Route Handlers.
 * @param name The name of the cookie.
 * @param value The value of the cookie.
 * @param options Additional options like maxAge, path, secure, httpOnly, etc.
 */
export async function setCookie(
	name: string,
	value: string,
	options?: CookieOptions
): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set(name, value, options);
}

/**
 * Delete a cookie by name on the server.
 * Note: This can only be called in Server Actions or Route Handlers.
 * @param name The name of the cookie to delete.
 * @param options Additional options (like path or domain) if needed to match the cookie to delete.
 */
export async function deleteCookie(
	name: string,
	options?: Partial<Pick<CookieOptions, "path" | "domain">>
): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete({ name, ...options });
}

/**
 * Get all cookies as an array of key-value objects.
 */
export async function getAllCookies(): Promise<
	Array<{ name: string; value: string }>
> {
	const cookieStore = await cookies();
	return cookieStore.getAll().map(c => ({ name: c.name, value: c.value }));
}

/**
 * Clear all cookies.
 * Note: This can only be called in Server Actions or Route Handlers.
 */
export async function clearAllCookies(): Promise<void> {
	const cookieStore = await cookies();
	const all = cookieStore.getAll();
	for (const c of all) {
		cookieStore.delete(c.name);
	}
}
