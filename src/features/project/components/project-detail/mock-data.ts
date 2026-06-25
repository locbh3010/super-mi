export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type TaskAssignee = {
	id: string;
	name: string;
};

export type Task = {
	id: string;
	title: string;
	description?: string;
	status: TaskStatus;
	priority: TaskPriority;
	assignee?: TaskAssignee;
	dueDate: string;
};

export type MemberRole = "owner" | "manager" | "member";

export type Member = {
	id: string;
	name: string;
	email: string;
	role: MemberRole;
	joinedAt: string;
};

export const STATUS_META: Record<TaskStatus, { label: string; color: string }> =
	{
		todo: { label: "Cần làm", color: "#94a3b8" },
		in_progress: { label: "Đang làm", color: "#3b82f6" },
		review: { label: "Đang duyệt", color: "#f59e0b" },
		done: { label: "Hoàn thành", color: "#22c55e" },
	};

export const PRIORITY_META: Record<
	TaskPriority,
	{ label: string; color: string }
> = {
	low: { label: "Thấp", color: "default" },
	medium: { label: "Trung bình", color: "blue" },
	high: { label: "Cao", color: "orange" },
	urgent: { label: "Khẩn cấp", color: "red" },
};

export const MOCK_TASKS: Task[] = [
	{
		id: "t1",
		title: "Thiết kế giao diện trang chủ",
		description:
			"Hoàn thiện mockup và prototype cho trang chủ theo design system mới.",
		status: "in_progress",
		priority: "high",
		assignee: { id: "u1", name: "Nguyễn Văn An" },
		dueDate: "2026-06-20",
	},
	{
		id: "t2",
		title: "Xây dựng API xác thực",
		description: "Triển khai đăng nhập, đăng ký và refresh token.",
		status: "todo",
		priority: "urgent",
		assignee: { id: "u2", name: "Trần Thị Bình" },
		dueDate: "2026-06-18",
	},
	{
		id: "t3",
		title: "Viết tài liệu hướng dẫn",
		description: "Tài liệu onboarding cho thành viên mới của dự án.",
		status: "review",
		priority: "medium",
		assignee: { id: "u3", name: "Lê Minh Cường" },
		dueDate: "2026-06-25",
	},
	{
		id: "t4",
		title: "Tối ưu hiệu năng truy vấn",
		description: "Đánh index và cache cho các truy vấn chậm.",
		status: "done",
		priority: "high",
		assignee: { id: "u1", name: "Nguyễn Văn An" },
		dueDate: "2026-06-10",
	},
	{
		id: "t5",
		title: "Thiết lập CI/CD pipeline",
		description: "Tự động build, test và deploy lên môi trường staging.",
		status: "in_progress",
		priority: "medium",
		assignee: { id: "u4", name: "Phạm Thu Dung" },
		dueDate: "2026-06-22",
	},
	{
		id: "t6",
		title: "Kiểm thử tích hợp",
		description: "Viết test case cho luồng thanh toán end-to-end.",
		status: "todo",
		priority: "low",
		assignee: { id: "u2", name: "Trần Thị Bình" },
		dueDate: "2026-06-28",
	},
	{
		id: "t7",
		title: "Sửa lỗi hiển thị trên mobile",
		description: "Khắc phục layout vỡ trên màn hình nhỏ.",
		status: "done",
		priority: "urgent",
		assignee: { id: "u3", name: "Lê Minh Cường" },
		dueDate: "2026-06-08",
	},
	{
		id: "t8",
		title: "Tích hợp cổng thanh toán",
		description: "Kết nối với cổng thanh toán bên thứ ba.",
		status: "review",
		priority: "high",
		assignee: { id: "u4", name: "Phạm Thu Dung" },
		dueDate: "2026-06-30",
	},
];

export const MOCK_MEMBERS: Member[] = [
	{
		id: "u1",
		name: "Nguyễn Văn An",
		email: "an.nguyen@example.com",
		role: "owner",
		joinedAt: "2026-01-15",
	},
	{
		id: "u2",
		name: "Trần Thị Bình",
		email: "binh.tran@example.com",
		role: "manager",
		joinedAt: "2026-02-03",
	},
	{
		id: "u3",
		name: "Lê Minh Cường",
		email: "cuong.le@example.com",
		role: "member",
		joinedAt: "2026-03-12",
	},
	{
		id: "u4",
		name: "Phạm Thu Dung",
		email: "dung.pham@example.com",
		role: "member",
		joinedAt: "2026-04-01",
	},
	{
		id: "u5",
		name: "Hoàng Văn Em",
		email: "em.hoang@example.com",
		role: "member",
		joinedAt: "2026-05-20",
	},
];

export const ROLE_META: Record<MemberRole, { label: string; color: string }> = {
	owner: { label: "Chủ sở hữu", color: "gold" },
	manager: { label: "Quản lý", color: "blue" },
	member: { label: "Thành viên", color: "default" },
};
