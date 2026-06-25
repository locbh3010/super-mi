"use client";

import { HomeOutlined, ReloadOutlined } from "@ant-design/icons";
import { ROUTES } from "@/constants/routes";
import { Button, Result, Space } from "antd";
import type { ResultProps } from "antd";
import { createStyles } from "antd-style";
import Link from "next/link";

const useStyles = createStyles(({ token, css, responsive }) => ({
	wrapper: css`
		min-height: 70vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: ${token.paddingLG}px;
		${responsive.mobile} {
			min-height: 60vh;
			padding: ${token.padding}px;
		}
	`,
}));

type StatusResultProps = {
	status?: ResultProps["status"];
	title?: React.ReactNode;
	subTitle?: React.ReactNode;
	/** Hiển thị nút "Về trang chủ". Mặc định true. */
	showHome?: boolean;
	/** Đường dẫn cho nút trang chủ. Mặc định là dashboard. */
	homeHref?: string;
	/** Callback cho nút "Thử lại". Nếu có sẽ hiển thị nút này. */
	onRetry?: () => void;
	/** Các nút hành động tùy chỉnh thêm. */
	extra?: React.ReactNode;
};

/**
 * Component hiển thị trạng thái (404, 500, error...) dùng chung cho
 * các trang not-found và error boundary.
 */
export function StatusResult({
	status = "404",
	title = "404",
	subTitle = "Xin lỗi, trang bạn truy cập không tồn tại.",
	showHome = true,
	homeHref = ROUTES.DASHBOARD.ROOT,
	onRetry,
	extra,
}: StatusResultProps) {
	const { styles } = useStyles();

	return (
		<div className={styles.wrapper}>
			<Result
				status={status}
				title={title}
				subTitle={subTitle}
				extra={
					<Space wrap>
						{onRetry ? (
							<Button
								type="primary"
								icon={<ReloadOutlined />}
								onClick={onRetry}
							>
								Thử lại
							</Button>
						) : null}
						{showHome ? (
							<Link href={homeHref}>
								<Button
									type={onRetry ? "default" : "primary"}
									icon={<HomeOutlined />}
								>
									Về trang chủ
								</Button>
							</Link>
						) : null}
						{extra}
					</Space>
				}
			/>
		</div>
	);
}
