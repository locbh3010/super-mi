"use client";

import { message } from "@/components/providers/Providers";
import { ROUTES } from "@/constants/routes";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginWithEmailAndPassword } from "../services";
import { LoginFormValues } from "../types";
import { getQueryClient } from "@/configs/query-client";
import { LOGGED_USER_QUERY_KEY } from "@/features/auth/hooks/use-fetch-logged-user";

export function useLogin() {
	const router = useRouter();
	const qc = getQueryClient();

	return useMutation({
		mutationFn: (payload: LoginFormValues) =>
			loginWithEmailAndPassword(payload),
		onSuccess: () => {
			message.success("Đăng nhập thành công!");
			router.push(ROUTES.DASHBOARD.ROOT);
			qc.invalidateQueries({ queryKey: LOGGED_USER_QUERY_KEY });
		},
	});
}
