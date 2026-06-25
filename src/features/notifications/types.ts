export interface Notification {
	id: string;
	title: string;
	message: string;
	type: "info" | "warning" | "success" | "error";
	isRead: boolean;
	createdAt: string;
}

export interface NotificationPopoverProps {
	/** Max height of the notification list inside the popover. Defaults to 360 */
	maxHeight?: number | string;
	/** Width of the popover content. Defaults to 380 */
	width?: number;
}