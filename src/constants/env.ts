import { forEach } from "lodash-es";

export const ENV = {
	R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID!,
	R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID!,
	R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY!,
	R2_BUCKET_NAME: process.env.R2_BUCKET_NAME!,
	R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL!,
	S3_ENDPOINT: process.env.S3_ENDPOINT!,
	SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
	SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
	SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
} as const;

forEach(ENV, (value, key) => {
	if (!value) {
		throw new Error(`${key} is not defined`);
	}
});
