"use client";

import { CalendarOutlined } from "@ant-design/icons";
import type { DropResult } from "@hello-pangea/dnd";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Avatar, Badge, Button, Space, Spin, Tag, Tooltip } from "antd";
import clsx from "clsx";
import dayjs from "dayjs";
import { useProjectDetailStyles } from "../../styles";
import { PRIORITY_META, STATUS_META } from "@/features/task/constants";
import type { KanbanColumnData, Task, TaskStatus } from "@/features/task";

function formatDate(iso?: string | null) {
	if (!iso) return "—";
	const d = dayjs(iso);
	return d.isValid() ? d.format("DD/MM/YYYY") : "—";
}

type KanbanCardProps = {
	task: Task;
	index: number;
	onClick: (task: Task) => void;
	onEdit: (task: Task) => void;
	onDelete: (task: Task) => void;
};

function KanbanCard({
	task,
	index,
	onClick,
	onEdit,
	onDelete,
}: KanbanCardProps) {
	const { styles } = useProjectDetailStyles();
	const priority = PRIORITY_META[task.priority];
	const assignee = task.assignees[0];
	const assigneeName = assignee?.display_name || assignee?.email || "";

	return (
		<Draggable draggableId={task.id} index={index}>
			{(provided, snapshot) => {
				// Tách style khỏi draggableProps để tránh xung đột
				// DraggingStyle với Radix CSSProperties (--radix-* index)
				const { style: dragStyle, ...restDraggableProps } =
					provided.draggableProps;
				const dragHandleProps = provided.dragHandleProps;

				return (
					<div
						ref={provided.innerRef}
						{...restDraggableProps}
						{...dragHandleProps}
						className={clsx(
							styles.kanbanCard,
							snapshot.isDragging && styles.kanbanCardDragging
						)}
						style={dragStyle as React.CSSProperties}
						onClick={() => onClick(task)}
					>
						<div className={styles.taskCardHead}>
							<Tag color={priority.color}>{priority.label}</Tag>
							<Space size={4}>
								{assigneeName ? (
									<Tooltip title={assigneeName}>
										<Avatar
											size="small"
											src={
												assignee?.avatar_url ??
												undefined
											}
										>
											{assigneeName
												.charAt(0)
												.toUpperCase()}
										</Avatar>
									</Tooltip>
								) : null}
							</Space>
						</div>
						<p className={styles.taskTitle}>{task.title}</p>
						<span className={styles.taskMeta}>
							<CalendarOutlined />
							{formatDate(task.due_at)}
						</span>
					</div>
				);
			}}
		</Draggable>
	);
}

type KanbanColumnProps = {
	column: KanbanColumnData;
	onLoadMore: (status: TaskStatus) => void;
	onTaskClick: (task: Task) => void;
	onTaskEdit: (task: Task) => void;
	onTaskDelete: (task: Task) => void;
};

function KanbanColumn({
	column,
	onLoadMore,
	onTaskClick,
	onTaskEdit,
	onTaskDelete,
}: KanbanColumnProps) {
	const { styles } = useProjectDetailStyles();
	const meta = STATUS_META[column.status];

	return (
		<Droppable droppableId={column.status} type="TASK">
			{(provided, snapshot) => (
				<div
					ref={provided.innerRef}
					{...provided.droppableProps}
					className={clsx(
						styles.kanbanColumn,
						snapshot.isDraggingOver && styles.kanbanColumnOver
					)}
				>
					<div className={styles.kanbanColumnHead}>
						<span className={styles.kanbanColumnTitle}>
							<Badge color={meta.color} text={meta.label} />
						</span>
						<Tag>{column.total}</Tag>
					</div>
					<div className={styles.kanbanList}>
						{column.isLoading ? (
							<div className={styles.kanbanEmpty}>
								<Spin size="small" />
							</div>
						) : (
							column.tasks.map((task, index) => (
								<KanbanCard
									key={task.id}
									task={task}
									index={index}
									onClick={onTaskClick}
									onEdit={onTaskEdit}
									onDelete={onTaskDelete}
								/>
							))
						)}
						{provided.placeholder}
						{!column.isLoading &&
						column.tasks.length === 0 &&
						!snapshot.isDraggingOver ? (
							<div className={styles.kanbanEmpty}>
								Kéo thả vào đây
							</div>
						) : null}
						{column.hasNextPage ? (
							<Button
								size="small"
								type="text"
								block
								loading={column.isFetchingNextPage}
								onClick={() => onLoadMore(column.status)}
							>
								Tải thêm
							</Button>
						) : null}
					</div>
				</div>
			)}
		</Droppable>
	);
}

type KanbanBoardProps = {
	columns: KanbanColumnData[];
	onDragEnd: (result: DropResult) => void;
	onLoadMore: (status: TaskStatus) => void;
	onTaskClick: (task: Task) => void;
	onTaskEdit: (task: Task) => void;
	onTaskDelete: (task: Task) => void;
};

export function KanbanBoard({
	columns,
	onDragEnd,
	onLoadMore,
	onTaskClick,
	onTaskEdit,
	onTaskDelete,
}: KanbanBoardProps) {
	const { styles } = useProjectDetailStyles();

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<div className={styles.kanban}>
				{columns.map(column => (
					<KanbanColumn
						key={column.status}
						column={column}
						onLoadMore={onLoadMore}
						onTaskClick={onTaskClick}
						onTaskEdit={onTaskEdit}
						onTaskDelete={onTaskDelete}
					/>
				))}
			</div>
		</DragDropContext>
	);
}
