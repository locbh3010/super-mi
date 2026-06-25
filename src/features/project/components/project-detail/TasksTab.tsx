"use client";

import {
	PlusOutlined,
	ProjectOutlined,
	SearchOutlined,
	TableOutlined,
} from "@ant-design/icons";
import type { DropResult } from "@hello-pangea/dnd";
import type { TableProps } from "antd";
import {
	Avatar,
	Badge,
	Button,
	Input,
	Segmented,
	Space,
	Table,
	Tag,
	Tooltip,
	Typography,
} from "antd";
import { useDebounce } from "ahooks";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { useProjectDetailStyles } from "../../styles";
import { KanbanBoard, TaskActionsMenu } from "./KanbanBoard";
import { PRIORITY_META, STATUS_META } from "@/features/task/constants";
import {
	TaskStatus,
	useDeleteTask,
	useKanbanTasks,
	useTasks,
	useUpdateTask,
	type Task,
} from "@/features/task";
import { TaskFormDrawer } from "@/features/task/components";

type ViewMode = "kanban" | "table";

function formatDate(iso?: string | null) {
	if (!iso) return "—";
	const d = dayjs(iso);
	return d.isValid() ? d.format("DD/MM/YYYY") : "—";
}

/** State local: map status -> danh sách task (clone từ react-query để dnd mượt). */
type ColumnsState = Record<TaskStatus, Task[]>;

const EMPTY_COLUMNS: ColumnsState = {
	[TaskStatus.TODO]: [],
	[TaskStatus.IN_PROGRESS]: [],
	[TaskStatus.REVIEW]: [],
	[TaskStatus.DONE]: [],
};

type TasksTabProps = {
	projectId: string;
};

export function TasksTab({ projectId }: TasksTabProps) {
	const { styles } = useProjectDetailStyles();
	const [view, setView] = useState<ViewMode>("kanban");
	const [search, setSearch] = useState("");
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [editingTaskId, setEditingTaskId] = useState<string | undefined>();

	const debouncedSearch = useDebounce(search, { wait: 400 });

	const kanbanColumns = useKanbanTasks(projectId, debouncedSearch);
	const { mutateAsync: updateTaskAsync } = useUpdateTask();
	const { mutate: deleteTaskMutate } = useDeleteTask();

	const openCreate = () => {
		setEditingTaskId(undefined);
		setDrawerOpen(true);
	};

	const openEdit = useCallback((task: Task) => {
		setEditingTaskId(task.id);
		setDrawerOpen(true);
	}, []);

	const handleDelete = useCallback(
		(task: Task) => {
			deleteTaskMutate({ id: task.id, projectId });
		},
		[deleteTaskMutate, projectId]
	);

	const closeDrawer = () => {
		setDrawerOpen(false);
		setEditingTaskId(undefined);
	};

	// Clone server data -> local để xử lý dnd không phải refetch.
	const [localColumns, setLocalColumns] =
		useState<ColumnsState>(EMPTY_COLUMNS);

	// Sync local từ react-query mỗi khi data đổi (sau fetch / load-more / search).
	const columnsSignature = kanbanColumns
		.map(c => `${c.status}:${c.tasks.map(t => t.id).join(",")}`)
		.join("|");

	useEffect(() => {
		setLocalColumns(prev => {
			const next = { ...prev };
			kanbanColumns.forEach(c => {
				next[c.status] = c.tasks;
			});
			return next;
		});
		// columnsSignature đại diện cho nội dung tasks theo từng cột.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [columnsSignature]);

	const handleLoadMore = useCallback(
		(status: TaskStatus) => {
			kanbanColumns.find(c => c.status === status)?.fetchNextPage();
		},
		[kanbanColumns]
	);

	const handleDragEnd = useCallback(
		(result: DropResult) => {
			const { draggableId, source, destination } = result;
			if (!destination) return;

			const from = source.droppableId as TaskStatus;
			const to = destination.droppableId as TaskStatus;

			// Drop cùng vị trí — không làm gì.
			if (from === to && source.index === destination.index) return;

			// Snapshot để rollback nếu API lỗi.
			const snapshot = localColumns;

			if (from === to) {
				// Reorder trong cùng cột — chỉ local (chưa có cột index để persist).
				const list = [...localColumns[from]];
				const [moved] = list.splice(source.index, 1);
				list.splice(destination.index, 0, moved);
				setLocalColumns({ ...localColumns, [from]: list });
				return;
			}

			// Chuyển cột — optimistic move local + persist status qua API.
			const fromList = [...localColumns[from]];
			const [moved] = fromList.splice(source.index, 1);
			if (!moved) return;

			const movedUpdated: Task = { ...moved, status: to };
			const toList = [...localColumns[to]];
			toList.splice(destination.index, 0, movedUpdated);

			setLocalColumns({
				...localColumns,
				[from]: fromList,
				[to]: toList,
			});

			updateTaskAsync({ id: moved.id, status: to }).catch(() => {
				// Lỗi đã toast trong useUpdateTask.onError → rollback local.
				setLocalColumns(snapshot);
			});
		},
		[localColumns, updateTaskAsync]
	);

	// Ghép local + metadata (total/hasNextPage...) từ react-query để render board.
	const boardColumns = kanbanColumns.map(c => ({
		...c,
		tasks: localColumns[c.status] ?? [],
	}));

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
						onClick={openCreate}
					>
						Thêm công việc
					</Button>
				</div>
			</div>

			{view === "kanban" ? (
				<KanbanBoard
					columns={boardColumns}
					onDragEnd={handleDragEnd}
					onLoadMore={handleLoadMore}
					onTaskClick={openEdit}
					onTaskEdit={openEdit}
					onTaskDelete={handleDelete}
				/>
			) : (
				<TableView
					projectId={projectId}
					search={debouncedSearch}
					onRowClick={openEdit}
					onEdit={openEdit}
					onDelete={handleDelete}
				/>
			)}

			<TaskFormDrawer
				projectId={projectId}
				taskId={editingTaskId}
				open={drawerOpen}
				onClose={closeDrawer}
				onCreated={closeDrawer}
				onUpdated={closeDrawer}
			/>
		</div>
	);
}

const TABLE_PAGE_SIZE = 20;

function TableView({
	projectId,
	search,
	onRowClick,
	onEdit,
	onDelete,
}: {
	projectId: string;
	search?: string;
	onRowClick: (task: Task) => void;
	onEdit: (task: Task) => void;
	onDelete: (task: Task) => void;
}) {
	const { styles } = useProjectDetailStyles();
	const [page, setPage] = useState(1);

	const { data, isFetching } = useTasks({
		projectId,
		page,
		limit: TABLE_PAGE_SIZE,
		search,
	});

	const columns: TableProps<Task>["columns"] = [
		{
			title: "Công việc",
			dataIndex: "title",
			key: "title",
			render: (_, record) => (
				<Typography.Text strong>{record.title}</Typography.Text>
			),
		},
		{
			title: "Người phụ trách",
			key: "assignee",
			width: 200,
			render: (_, record) => {
				const a = record.assignees[0];
				const name = a?.display_name || a?.email;
				return name ? (
					<Space size="small">
						<Tooltip title={name}>
							<Avatar size="small" src={a?.avatar_url ?? undefined}>
								{name.charAt(0).toUpperCase()}
							</Avatar>
						</Tooltip>
						<span>{name}</span>
					</Space>
				) : (
					"—"
				);
			},
		},
		{
			title: "Trạng thái",
			dataIndex: "status",
			key: "status",
			width: 150,
			render: (status: TaskStatus) => {
				const meta = STATUS_META[status];
				return <Badge color={meta.color} text={meta.label} />;
			},
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
			dataIndex: "due_at",
			key: "due_at",
			width: 130,
			render: (iso: string) => formatDate(iso),
		},
		{
			title: "Thao tác",
			key: "actions",
			width: 80,
			align: "center",
			render: (_, record) => (
				<TaskActionsMenu
					task={record}
					onEdit={onEdit}
					onDelete={onDelete}
				/>
			),
		},
	];

	return (
		<div className={styles.tableCard}>
			<Table<Task>
				rowKey="id"
				columns={columns}
				dataSource={data?.items ?? []}
				loading={isFetching}
				scroll={{ x: "max-content" }}
				onRow={record => ({
					onClick: () => onRowClick(record),
					style: { cursor: "pointer" },
				})}
				pagination={{
					current: page,
					pageSize: TABLE_PAGE_SIZE,
					total: data?.total ?? 0,
					onChange: setPage,
					showSizeChanger: false,
				}}
			/>
		</div>
	);
}
