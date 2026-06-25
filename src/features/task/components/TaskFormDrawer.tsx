"use client";

import { useState } from "react";
import type { DatePickerProps } from "antd";
import { Button, Col, DatePicker, Drawer, Form, Input, Row, Select, Space } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { MemberSelect } from "@/features/project/components";
import { RichEditor } from "@/components/rich-editor";
import type { ImageBlobMapping } from "@/components/rich-editor/types";
import { PrioritySelect } from "./PrioritySelect";
import {
	TASK_FORM_DEFAULTS,
	TASK_STATUS_OPTIONS,
} from "../constants";
import { useCreateTask } from "../hooks";
import type { CreateTaskFormValues, Task } from "../types";

type TaskFormDrawerProps = {
	projectId: string;
	onClose: VoidFunction;
	/** Gọi sau khi tạo task thành công (vd: parent đóng drawer, refresh). */
	onCreated?: (task: Task) => void;
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
	open,
	onClose,
	onCreated,
}: TaskFormDrawerProps) {
	const [form] = Form.useForm<FormFields>();
	const [imageMappings, setImageMappings] = useState<ImageBlobMapping[]>([]);
	const { mutateAsync, isPending } = useCreateTask();

	const handleClose = () => {
		form.resetFields();
		setImageMappings([]);
		onClose();
	};

	const handleFinish = async (values: FormFields) => {
		const html = values.description ?? "";
		// Chỉ giữ ảnh còn xuất hiện trong html (ảnh đã xóa khỏi editor thì bỏ).
		const usedImages = imageMappings.filter(m => html.includes(m.blobUrl));

		try {
			const task = await mutateAsync({
				...values,
				projectId,
				dueDate: values.dueDate
					? values.dueDate.format("YYYY-MM-DD")
					: null,
				images: usedImages,
			});

			form.resetFields();
			setImageMappings([]);
			onCreated?.(task);
		} catch {
			// Lỗi đã được toast trong useCreateTask.onError; giữ nguyên form để thử lại.
		}
	};

	const disabledDate: DatePickerProps["disabledDate"] = current => {
		return current && current < dayjs().startOf("day");
	};

	return (
		<Drawer
			title="Thêm công việc"
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
						Tạo công việc
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
						onImageInsert={m => setImageMappings(prev => [...prev, m])}
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
