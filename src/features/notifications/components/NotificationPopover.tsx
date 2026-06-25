"use client";

import { BellOutlined } from "@ant-design/icons";
import { Badge, Button, Divider, Popover, Typography } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import React from "react";
import { ScrollArea } from "@/components/scroll";
import { useNotificationPopoverStyles } from "./styles";
import type { Notification, NotificationPopoverProps } from "../types";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Text } = Typography;

const NotificationPopover: React.FC<NotificationPopoverProps> = ({
	maxHeight = 360,
	width = 380,
}) => {
	const { styles } = useNotificationPopoverStyles();

	// ── Mock data ──────────────────────────────────────────────────────────
	const notifications: Notification[] = [
		{
			id: "1",
			title: "Dự án mới được tạo",
			message:
				'Admin đã tạo dự án "Website Redesign" và thêm bạn làm thành viên.',
			type: "info",
			isRead: false,
			createdAt: dayjs().subtract(1, "hour").toISOString(),
		},
		{
			id: "2",
			title: "Bình luận mới",
			message:
				'Nguyễn Văn A đã bình luận trong task "Thiết kế trang chủ".',
			type: "success",
			isRead: false,
			createdAt: dayjs().subtract(2, "hours").toISOString(),
		},
		{
			id: "3",
			title: "Hạn chót sắp đến",
			message:
				'Task "API Integration" sẽ đến hạn vào ngày mai. Hãy kiểm tra tiến độ.',
			type: "warning",
			isRead: false,
			createdAt: dayjs().subtract(5, "hours").toISOString(),
		},
		{
			id: "4",
			title: "Tài khoản đã được cập nhật",
			message: "Thông tin tài khoản của bạn đã được cập nhật thành công.",
			type: "success",
			isRead: true,
			createdAt: dayjs().subtract(1, "day").toISOString(),
		},
		{
			id: "5",
			title: "Lỗi hệ thống",
			message: "Đã xảy ra lỗi khi đồng bộ dữ liệu. Vui lòng thử lại sau.",
			type: "error",
			isRead: true,
			createdAt: dayjs().subtract(2, "days").toISOString(),
		},
		{
			id: "6",
			title: "Cập nhật tính năng mới",
			message:
				"Phiên bản 2.4.0 đã được phát hành với nhiều cải tiến về hiệu suất và giao diện.",
			type: "info",
			isRead: true,
			createdAt: dayjs().subtract(3, "days").toISOString(),
		},
	];

	const unreadCount = notifications.filter(n => !n.isRead).length;

	const content = (
		<div className={styles.popoverContainer} style={{ width }}>
			<div className={styles.popoverHeader}>
				<Text strong className={styles.popoverTitle}>
					Thông báo
				</Text>
				<Button
					type="link"
					size="small"
					className={styles.markAllReadBtn}
				>
					Đánh dấu tất cả đã đọc
				</Button>
			</div>
			<Divider className={styles.divider} />
			<ScrollArea height={maxHeight} className={styles.scrollArea}>
				<div className={styles.list}>
					{notifications.map(item => (
						<div
							key={item.id}
							className={
								item.isRead
									? styles.notificationItem
									: styles.notificationItemUnread
							}
						>
							<div
								className={
									item.isRead
										? styles.itemDotRead
										: styles.itemDot
								}
							/>
							<div className={styles.itemContent}>
								<Text strong className={styles.itemTitle}>
									{item.title}
								</Text>
								<Text className={styles.itemMessage}>
									{item.message}
								</Text>
								<Text
									type="secondary"
									className={styles.itemTime}
								>
									{dayjs(item.createdAt).fromNow()}
								</Text>
							</div>
						</div>
					))}
				</div>
			</ScrollArea>
			<Divider className={styles.divider} />
			<div className={styles.popoverFooter}>
				<Button type="link" size="small">
					Xem tất cả thông báo
				</Button>
			</div>
		</div>
	);

	return (
		<Popover
			content={content}
			trigger="click"
			placement="bottomRight"
			arrow={false}
			overlayClassName={styles.popoverOverlay}
			styles={{
				container: {
					paddingInline: 0,
				},
			}}
		>
			<Badge count={unreadCount} size="small" className={styles.badge}>
				<Button
					type="text"
					icon={<BellOutlined />}
					className={styles.triggerBtn}
				/>
			</Badge>
		</Popover>
	);
};

export default NotificationPopover;
