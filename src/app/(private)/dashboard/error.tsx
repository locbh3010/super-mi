"use client";

import { StatusResult } from "@/components/feedback/StatusResult";
import { useEffect } from "react";

/**
 * Error boundary cho khu vực dashboard — bắt lỗi runtime trong các trang con
 * và hiển thị giao diện lỗi với nút thử lại (reset) + về trang chủ.
 */
export default function DashboardError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log lỗi để phục vụ debug / theo dõi.
		console.error(error);
	}, [error]);

	return (
		<StatusResult
			status="500"
			title="Đã xảy ra lỗi"
			subTitle="Rất tiếc, đã có sự cố xảy ra. Vui lòng thử lại."
			onRetry={reset}
		/>
	);
}
