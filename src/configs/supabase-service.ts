import { ENV } from "@/constants/env";
import { Database } from "@/types/database";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = ENV.SUPABASE_URL;
const supabaseServiceKey = ENV.SUPABASE_SERVICE_ROLE_KEY;

export const createServiceClient = () =>
	createClient<Database>(supabaseUrl, supabaseServiceKey, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
		},
	});
