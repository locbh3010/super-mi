import { StatusResult } from "@/components/feedback/StatusResult";

/**
 * Global not-found page — hiển thị khi Next.js không tìm thấy route.
 */
export default function NotFound() {
	return (
		<StatusResult
			status="404"
			title="404"
			subTitle="Xin lỗi, trang bạn truy cập không tồn tại."
		/>
	);
}
