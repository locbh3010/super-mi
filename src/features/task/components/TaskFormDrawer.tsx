"use client";

import { useEffect, useState } from "react";
import type { DatePickerProps } from "antd";
import { Button, Col, DatePicker, Drawer, Form, Input, Row, Select, Space } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { MemberSelect } from "@/features/project/components";
import { RichEditor } from "@/components/rich-editor";
import type { ImageBlobMapping } from "@/components/rich-editor/types";
import { PrioritySelect } from "./PrioritySelect";
import {
	TASK_FORM_DEFAULTS,
	TASK_STATUS_OPTIONS,
} from "../constants";
import { useCreateTask, useEditTask } from "../hooks";
import { taskByIdQueryOptions } from "../query-options";
import { TaskMemberType } from "../types";
import type { CreateTaskFormValues, Task } from "../types";

type TaskFormDrawerProps = {
	projectId: string;
	/** Có taskId => edit mode (fetch & fill default). */
	taskId?: string;
	onClose: VoidFunction;
	/** Gọi sau khi tạo/sửa thành công. */
	onCreated?: (task: Task) => void;
	onUpdated?: () => void;
	open: boolean;
};

/** Kiểu nội bộ của form — dueDate là Dayjs thay vì string. */
type FormFields = Omit<CreateTaskFormValues, "dueDate"> & {
	dueDate: Dayjs | null;
};

const INITIAL_VALUES: FormFields = {
	...TASK_FORM_DEFAULTS,
	status: TASK_FORM_DEFAULTS.status,
	priority: TASK_FORM_DEFAULTS.priority,
	dueDate: null,
};

export function TaskFormDrawer({
	projectId,
	taskId,
	open,
	onClose,
	onCreated,
	onUpdated,
}: TaskFormDrawerProps) {
	const [form] = Form.useForm<FormFields>();
	const [imageMappings, setImageMappings] = useState<ImageBlobMapping[]>([]);
	const isEdit = !!taskId;

	const { mutateAsync: createAsync, isPending: creating } = useCreateTask();
	const { mutateAsync: editAsync, isPending: editing } = useEditTask();
	const isPending = creating || editing;

	// Edit mode: fetch chi tiết task để fill default.
	const { data: taskDetail } = useQuery({
		...taskByIdQueryOptions(taskId ?? ""),
		enabled: open && isEdit,
	});

	// Fill form khi data về.
	useEffect(() => {
		if (!open || !isEdit || !taskDetail) return;
		form.setFieldsValue({
			title: taskDetail.title,
			description: taskDetail.description ?? "",
			status: taskDetail.status,
			priority: taskDetail.priority,
			dueDate: taskDetail.due_at ? dayjs(taskDetail.due_at) : null,
			implementIds: taskDetail.assignees
				.filter(a => a.type === TaskMemberType.IMPLEMENT)
				.map(a => a.user_id),
			watcherIds: taskDetail.assignees
				.filter(a => a.type === TaskMemberType.WATCHER)
				.map(a => a.user_id),
		});
	}, [open, isEdit, taskDetail, form]);

	const handleClose = () => {
		form.resetFields();
		setImageMappings([]);
		onClose();
	};

	const handleFinish = async (values: FormFields) => {
		const html = values.description ?? "";
		// Chỉ giữ ảnh blob còn xuất hiện trong html cuối cùng.
		const usedImages = imageMappings.filter(m => html.includes(m.blobUrl));
		const dueDate = values.dueDate
			? values.dueDate.format("YYYY-MM-DD")
			: null;

		try {
			if (isEdit && taskId) {
				await editAsync({
					...values,
					id: taskId,
					projectId,
					dueDate,
					images: usedImages,
				});
				form.resetFields();
				setImageMappings([]);
				onUpdated?.();
			} else {
				const task = await createAsync({
					...values,
					projectId,
					dueDate,
					images: usedImages,
				});
				form.resetFields();
				setImageMappings([]);
				onCreated?.(task);
			}
		} catch {
			// Lỗi đã toast trong hook; giữ form để thử lại.
		}
	};

	const disabledDate: DatePickerProps["disabledDate"] = current => {
		return current && current < dayjs().startOf("day");
	};

	return (
		<Drawer
			title={isEdit ? "Sửa công việc" : "Thêm công việc"}
			styles={{ wrapper: { width: 640, maxWidth: "100vw" } }}
			open={open}
			onClose={handleClose}
			destroyOnHidden
			footer={
				<Space style={{ display: "flex", justifyContent: "flex-end" }}>
					<Button onClick={handleClose} disabled={isPending}>
						Hủy
					</Button>
					<Button
						type="primary"
						loading={isPending}
						onClick={() => form.submit()}
					>
						{isEdit ? "Lưu" : "Tạo công việc"}
					</Button>
				</Space>
			}
		>
			<Form
				form={form}
				layout="vertical"
				initialValues={INITIAL_VALUES}
				requiredMark="optional"
				onFinish={handleFinish}
			>
				<Form.Item
					name="title"
					label="Tên công việc"
					rules={[
						{
							required: true,
							message: "Vui lòng nhập tên công việc",
						},
					]}
				>
					<Input placeholder="Nhập tên công việc" allowClear />
				</Form.Item>

				<Form.Item
					name="description"
					label="Mô tả"
					getValueFromEvent={(html: string) => html}
				>
					<RichEditor
						placeholder="Nhập mô tả chi tiết..."
						onImageInsert={m =>
							setImageMappings(prev => [...prev, m])
						}
					/>
				</Form.Item>

				<Row gutter={16}>
					<Col span={12}>
						<Form.Item name="status" label="Trạng thái">
							<Select options={TASK_STATUS_OPTIONS} />
						</Form.Item>
					</Col>

					<Col span={12}>
						<Form.Item name="priority" label="Ưu tiên">
							<PrioritySelect />
						</Form.Item>
					</Col>
				</Row>

				<Form.Item name="watcherIds" label="Người giám sát">
					<MemberSelect
						projectId={projectId}
						placeholder="Chọn người giám sát"
					/>
				</Form.Item>

				<Form.Item name="implementIds" label="Người phụ trách">
					<MemberSelect
						projectId={projectId}
						placeholder="Chọn người phụ trách"
					/>
				</Form.Item>

				<Form.Item name="dueDate" label="Hạn chót">
					<DatePicker
						style={{ width: "100%" }}
						format="DD/MM/YYYY"
						disabledDate={disabledDate}
						placeholder="Chọn ngày hạn chót"
					/>
				</Form.Item>
			</Form>
		</Drawer>
	);
}
