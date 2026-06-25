"use server";

import { createServerClient } from "@/configs/supabase-server";
import { createServiceClient } from "@/configs/supabase-service";
import { ROUTES } from "@/constants/routes";
import type { Provider } from "@supabase/supabase-js";
import { headers } from "next/headers";
import type { LoggedUser, LoginFormValues, RegisterFormValues } from "./types";
import { deriveDisplayName } from "@/utils/derive-display-name";

async function getOrigin() {
	const headerStore = await headers();
	return (
		headerStore.get("origin") ??
		`${headerStore.get("x-forwarded-proto") ?? "http"}://${headerStore.get("host")}`
	);
}

/**
 * Đăng nhập bằng email + mật khẩu.
 */
export async function loginWithEmailAndPassword(payload: LoginFormValues) {
	const supabase = await createServerClient();

	const { data, error } = await supabase.auth.signInWithPassword({
		email: payload.email,
		password: payload.password,
	});

	if (error) {
		throw new Error(error.message);
	}

	return data;
}

/**
 * Đăng ký tài khoản mới bằng email + mật khẩu.
 */
export async function registerWithEmailAndPassword(
	payload: RegisterFormValues
) {
	const supabase = await createServerClient();
	const displayName = deriveDisplayName(payload.email);

	const { data, error } = await supabase.auth.signUp({
		email: payload.email,
		password: payload.password,
		options: {
			data: { display_name: displayName },
		},
	});

	if (error) {
		throw new Error(error.message);
	}

	return data;
}

/**
 * Đăng xuất phiên hiện tại.
 */
export async function logout() {
	const supabase = await createServerClient();

	const { error } = await supabase.auth.signOut();

	if (error) {
		throw new Error(error.message);
	}
}

/**
 * Lấy thông tin profile của user đang đăng nhập (nếu có).
 */
export async function getLoggedUser(): Promise<LoggedUser | null> {
	const supabase = await createServerClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return null;
	}

	const { data: profile, error } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", user.id)
		.single();

	if (error) {
		throw new Error(error.message);
	}

	return profile;
}

/**
 * Lấy profile theo email. Dùng service client bypass RLS.
 * Trả về null nếu không tìm thấy.
 */
export async function getProfileByEmail(
	email: string
): Promise<LoggedUser | null> {
	const admin = createServiceClient();

	const { data, error } = await admin
		.from("profiles")
		.select("*")
		.eq("email", email)
		.maybeSingle();

	if (error) {
		throw new Error(error.message);
	}

	return data ?? null;
}

/**
 * Khởi tạo luồng đăng nhập OAuth. Trả về URL provider để client redirect.
 */
export async function oauth(provider: Provider) {
	const supabase = await createServerClient();
	const origin = await getOrigin();

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo: `${origin}${ROUTES.AUTH.OAUTH}`,
		},
	});

	if (error) {
		throw new Error(error.message);
	}

	return data.url;
}