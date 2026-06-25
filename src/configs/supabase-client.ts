import { ENV } from "@/constants/env";
import { Database } from "@/types/database";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = ENV.SUPABASE_URL;
const supabaseKey = ENV.SUPABASE_PUBLISHABLE_KEY;

export const createClient = () =>
	createBrowserClient<Database>(supabaseUrl!, supabaseKey!);
