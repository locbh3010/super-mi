import { createServerClient } from "@/configs/supabase-server";
import { ROUTES } from "@/constants/routes";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get("code");
	const next = searchParams.get("next") ?? ROUTES.DASHBOARD.ROOT;

	if (!code) {
		return NextResponse.redirect(`${origin}${ROUTES.AUTH.LOGIN}`);
	}

	const supabase = await createServerClient();

	const { error } = await supabase.auth.exchangeCodeForSession(code);

	if (error) {
		return NextResponse.redirect(
			`${origin}${ROUTES.AUTH.LOGIN}?error=${encodeURIComponent(error.message)}`
		);
	}

	return NextResponse.redirect(`${origin}${next}`);
}
