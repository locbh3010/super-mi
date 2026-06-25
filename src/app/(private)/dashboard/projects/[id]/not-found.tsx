import { StatusResult } from "@/components/feedback/StatusResult";
import { ROUTES } from "@/constants/routes";

/**
 * Not-found cho route chi tiết dự án — hiển thị bên trong dashboard layout
 * (giữ sidebar/header) khi dự án không tồn tại hoặc không có quyền truy cập.
 */
export default function ProjectNotFound() {
	return (
		<StatusResult
			status="404"
			title="Không tìm thấy dự án"
			subTitle="Dự án không tồn tại hoặc bạn không có quyền truy cập."
			homeHref={ROUTES.DASHBOARD.PROJECTS}
		/>
	);
}
