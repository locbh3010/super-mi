"use client";

import {
	PlusOutlined,
	ProjectOutlined,
	SearchOutlined,
	TableOutlined,
} from "@ant-design/icons";
import type { TableProps } from "antd";
import {
	Avatar,
	Badge,
	Button,
	Empty,
	Input,
	Segmented,
	Space,
	Table,
	Tag,
	Tooltip,
	Typography,
} from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useProjectDetailStyles } from "../../styles";
import { KanbanBoard } from "./KanbanBoard";
import {
	MOCK_TASKS,
	type Task,
	type TaskStatus,
} from "./mock-data";
import { PRIORITY_META, STATUS_META } from "@/features/task/constants";
import { TaskFormDrawer } from "@/features/task/components";

type ViewMode = "kanban" | "table";

function formatDate(iso?: string | null) {
	if (!iso) return "—";
	const d = dayjs(iso);
	return d.isValid() ? d.format("DD/MM/YYYY") : "—";
}

function AssigneeAvatar({ name }: { name?: string }) {
	if (!name) return null;
	return (
		<Tooltip title={name}>
			<Avatar size="small">{name.charAt(0).toUpperCase()}</Avatar>
		</Tooltip>
	);
}

function StatusBadge({ status }: { status: TaskStatus }) {
	const meta = STATUS_META[status];
	return <Badge color={meta.color} text={meta.label} />;
}

type TasksTabProps = {
	projectId: string;
};

export function TasksTab({ projectId }: TasksTabProps) {
	const { styles } = useProjectDetailStyles();
	const [view, setView] = useState<ViewMode>("kanban");
	const [search, setSearch] = useState("");
	const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return tasks;
		return tasks.filter(
			t =>
				t.title.toLowerCase().includes(q) ||
				t.description?.toLowerCase().includes(q)
		);
	}, [search, tasks]);

	return (
		<div>
			<div className={styles.toolbar}>
				<Input
					className={styles.search}
					prefix={<SearchOutlined />}
					placeholder="Tìm kiếm công việc..."
					allowClear
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>

				<div className={styles.toolbarRight}>
					<Segmented<ViewMode>
						value={view}
						onChange={setView}
						options={[
							{
								value: "kanban",
								icon: <ProjectOutlined />,
								title: "Kanban",
							},
							{
								value: "table",
								icon: <TableOutlined />,
								title: "Bảng",
							},
						]}
					/>
					<Button
						type="primary"
						icon={<PlusOutlined />}
						onClick={() => setDrawerOpen(true)}
					>
						Thêm công việc
					</Button>
				</div>
			</div>

			{view === "kanban" ? (
				<KanbanBoard tasks={filtered} onTasksChange={setTasks} />
			) : filtered.length === 0 ? (
				<Empty description="Không tìm thấy công việc" />
			) : (
				<TableView tasks={filtered} />
			)}

			<TaskFormDrawer
				projectId={projectId}
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				onCreated={() => setDrawerOpen(false)}
			/>
		</div>
	);
}

function TableView({ tasks }: { tasks: Task[] }) {
	const { styles } = useProjectDetailStyles();

	const columns: TableProps<Task>["columns"] = [
		{
			title: "Công việc",
			dataIndex: "title",
			key: "title",
			render: (_, record) => (
				<Space orientation="vertical" size={0}>
					<Typography.Text strong>{record.title}</Typography.Text>
					{record.description ? (
						<Typography.Text type="secondary">
							{record.description}
						</Typography.Text>
					) : null}
				</Space>
			),
		},
		{
			title: "Người phụ trách",
			dataIndex: "assignee",
			key: "assignee",
			width: 200,
			render: (_, record) =>
				record.assignee ? (
					<Space size="small">
						<AssigneeAvatar name={record.assignee.name} />
						<span>{record.assignee.name}</span>
					</Space>
				) : (
					"—"
				),
		},
		{
			title: "Trạng thái",
			dataIndex: "status",
			key: "status",
			width: 150,
			render: (status: TaskStatus) => <StatusBadge status={status} />,
		},
		{
			title: "Ưu tiên",
			dataIndex: "priority",
			key: "priority",
			width: 130,
			render: (priority: Task["priority"]) => {
				const meta = PRIORITY_META[priority];
				return <Tag color={meta.color}>{meta.label}</Tag>;
			},
		},
		{
			title: "Hạn chót",
			dataIndex: "dueDate",
			key: "dueDate",
			width: 130,
			render: (iso: string) => formatDate(iso),
		},
	];

	return (
		<div className={styles.tableCard}>
			<Table<Task>
				rowKey="id"
				columns={columns}
				dataSource={tasks}
				scroll={{ x: "max-content" }}
				pagination={false}
			/>
		</div>
	);
}
