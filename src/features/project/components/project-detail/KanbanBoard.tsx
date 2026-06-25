"use client";

import { CalendarOutlined } from "@ant-design/icons";
import type { DropResult } from "@hello-pangea/dnd";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Avatar, Badge, Tag, Tooltip } from "antd";
import clsx from "clsx";
import dayjs from "dayjs";
import { useCallback } from "react";
import { useProjectDetailStyles } from "../../styles";
import {
	type Task,
	type TaskStatus,
} from "./mock-data";
import { PRIORITY_META, STATUS_META } from "@/features/task/constants";

const KANBAN_COLUMNS: TaskStatus[] = ["todo", "in_progress", "review", "done"];

function formatDate(iso: string) {
	const d = dayjs(iso);
	return d.isValid() ? d.format("DD/MM/YYYY") : "—";
}

/**
 * Sắp xếp lại task trong mảng phẳng.
 * @returns mảng mới hoặc tasks cũ nếu không thay đổi
 */
function reorderTasks(
	tasks: Task[],
	sourceId: string,
	sourceIndex: number,
	destStatus: TaskStatus,
	destIndex: number
): Task[] {
	// Lọc ra các task của status đích (theo thứ tự hiện tại)
	const sameStatusTasks = tasks.filter(t => t.status === destStatus);

	// Tìm task được kéo
	const moved = tasks.find(t => t.id === sourceId);
	if (!moved) return tasks;

	// Nếu không có thay đổi gì
	if (moved.status === destStatus && sourceIndex === destIndex) return tasks;

	// Tạo mảng mới không có task được kéo
	const without = tasks.filter(t => t.id !== sourceId);

	// Cập nhật status nếu khác
	const updated = { ...moved, status: destStatus };

	// Tìm vị trí cần chèn trong danh sách tổng
	const sameStatusBefore = sameStatusTasks.slice(0, destIndex);
	const insertBeforeId = sameStatusBefore.length > 0
		? sameStatusBefore[sameStatusBefore.length - 1].id
		: null;

	if (insertBeforeId) {
		// Chèn sau task cuối cùng trước vị trí đích
		const insertIdx = without.findIndex(t => t.id === insertBeforeId);
		const next = [...without];
		next.splice(insertIdx + 1, 0, updated);
		return next;
	} else {
		// Chèn vào đầu nhóm status đích
		const firstOfStatus = without.findIndex(t => t.status === destStatus);
		const next = [...without];
		if (firstOfStatus === -1) {
			// Status đích chưa có task nào
			next.push(updated);
		} else {
			next.splice(firstOfStatus, 0, updated);
		}
		return next;
	}
}

type KanbanCardProps = {
	task: Task;
	index: number;
};

function KanbanCard({ task, index }: KanbanCardProps) {
	const { styles } = useProjectDetailStyles();
	const priority = PRIORITY_META[task.priority];

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
					>
						<div className={styles.taskCardHead}>
							<Tag color={priority.color}>{priority.label}</Tag>
							{task.assignee ? (
								<Tooltip title={task.assignee.name}>
									<Avatar size="small">
										{task.assignee.name.charAt(0).toUpperCase()}
									</Avatar>
								</Tooltip>
							) : null}
						</div>
						<p className={styles.taskTitle}>{task.title}</p>
						<span className={styles.taskMeta}>
							<CalendarOutlined />
							{formatDate(task.dueDate)}
						</span>
					</div>
				);
			}}
		</Draggable>
	);
}

type KanbanColumnProps = {
	status: TaskStatus;
	tasks: Task[];
};

function KanbanColumn({ status, tasks }: KanbanColumnProps) {
	const { styles } = useProjectDetailStyles();
	const meta = STATUS_META[status];

	return (
		<Droppable droppableId={status} type="TASK">
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
						<Tag>{tasks.length}</Tag>
					</div>
					<div className={styles.kanbanList}>
						{tasks.map((task, index) => (
							<KanbanCard key={task.id} task={task} index={index} />
						))}
						{provided.placeholder}
						{tasks.length === 0 && !snapshot.isDraggingOver ? (
							<div className={styles.kanbanEmpty}>Kéo thả vào đây</div>
						) : null}
					</div>
				</div>
			)}
		</Droppable>
	);
}

type KanbanBoardProps = {
	tasks: Task[];
	onTasksChange: (tasks: Task[]) => void;
};

export function KanbanBoard({ tasks, onTasksChange }: KanbanBoardProps) {
	const { styles } = useProjectDetailStyles();

	const handleDragEnd = useCallback(
		(result: DropResult) => {
			const { draggableId, source, destination } = result;

			// Drop ngoài vùng hợp lệ — không làm gì, item tự trở về vị trí cũ
			if (!destination) return;

			// Drop cùng vị trí — không làm gì
			if (
				source.droppableId === destination.droppableId &&
				source.index === destination.index
			)
				return;

			const next = reorderTasks(
				tasks,
				draggableId,
				source.index,
				destination.droppableId as TaskStatus,
				destination.index
			);

			if (next !== tasks) onTasksChange(next);
		},
		[tasks, onTasksChange]
	);

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<div className={styles.kanban}>
				{KANBAN_COLUMNS.map(status => (
					<KanbanColumn
						key={status}
						status={status}
						tasks={tasks.filter(t => t.status === status)}
					/>
				))}
			</div>
		</DragDropContext>
	);
}
