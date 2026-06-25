import { ENV } from "@/constants/env";
import { Database } from "@/types/database";
import { createServerClient as createServer } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = ENV.SUPABASE_URL;
const supabaseKey = ENV.SUPABASE_PUBLISHABLE_KEY;

export const createServerClient = async () => {
	const cookieStore = await cookies();

	return createServer<Database>(supabaseUrl!, supabaseKey!, {
		cookies: {
			getAll() {
				return cookieStore.getAll();
			},
			setAll(cookiesToSet) {
				try {
					cookiesToSet.forEach(({ name, value, options }) =>
						cookieStore.set(name, value, options)
					);
				} catch {
					// The `setAll` method was called from a Server Component.
					// This can be ignored if you have middleware refreshing
					// user sessions.
				}
			},
		},
	});
};
