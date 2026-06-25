"use client";

import { message } from "@/components/providers/Providers";
import { ROUTES } from "@/constants/routes";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { logout } from "../services";
import { getQueryClient } from "@/configs/query-client";
import { LOGGED_USER_QUERY_KEY } from "@/features/auth/hooks/use-fetch-logged-user";

export function useLogout() {
	const router = useRouter();
	const qc = getQueryClient();

	return useMutation({
		mutationFn: () => logout(),
		onSuccess: () => {
			message.success("Đăng xuất thành công!");
			router.push(ROUTES.AUTH.LOGIN);
			qc.invalidateQueries({ queryKey: LOGGED_USER_QUERY_KEY });
		},
	});
}
