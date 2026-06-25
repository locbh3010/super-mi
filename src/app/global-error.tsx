"use client";

import { StatusResult } from "@/components/feedback/StatusResult";
import { Providers } from "@/components/providers/Providers";
import { useEffect } from "react";
import "antd/dist/reset.css";

/**
 * Global error boundary — bắt lỗi nghiêm trọng ở cấp root layout.
 * File này thay thế toàn bộ root layout nên phải tự render <html>/<body>
 * và bọc lại Providers để antd hiển thị đúng theme.
 */
export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<html lang="vi">
			<body>
				<Providers>
					<StatusResult
						status="error"
						title="Đã xảy ra lỗi nghiêm trọng"
						subTitle="Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại."
						showHome={false}
						onRetry={reset}
					/>
				</Providers>
			</body>
		</html>
	);
}
