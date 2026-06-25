"use client";
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import { Alert, Button, Drawer, Form, Input, Space, Upload } from "antd";
import ImgCrop from "antd-img-crop";
import { useState } from "react";
import { useCreateProject } from "../hooks/use-create-project";
import { useProjectsPageStyles } from "../styles";
import type { CreateProjectPayload } from "../types";

type ProjectFormDrawerProps = {
	open: boolean;
	onClose: () => void;
};

export function ProjectFormDrawer({ open, onClose }: ProjectFormDrawerProps) {
	const { styles } = useProjectsPageStyles();
	const [form] = Form.useForm<CreateProjectPayload>();
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const {
		mutate: createProject,
		isPending,
		isError,
		error,
	} = useCreateProject();

	const handleClose = () => {
		form.resetFields();
		setFileList([]);
		onClose();
	};

	const handleSubmit = (values: CreateProjectPayload) => {
		const thumbnailFile = fileList[0]?.originFileObj as File | undefined;

		createProject(
			{
				name: values.name,
				description: values.description,
				thumbnailFile,
			},
			{
				onSuccess: () => handleClose(),
			}
		);
	};

	return (
		<Drawer
			title="Thêm dự án"
			styles={{ wrapper: { width: 480, maxWidth: "100vw" } }}
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
						onClick={() => form.submit()}
						loading={isPending}
					>
						Tạo dự án
					</Button>
				</Space>
			}
		>
			{isError && error.message && (
				<Alert
					title="Thất bại"
					description={error.message}
					type="error"
					style={{ marginBottom: 16 }}
				/>
			)}
			<Form
				form={form}
				layout="vertical"
				className={styles.drawerForm}
				requiredMark="optional"
				onFinish={handleSubmit}
			>
				<Form.Item
					name="name"
					label="Tên dự án"
					rules={[
						{ required: true, message: "Vui lòng nhập tên dự án" },
					]}
				>
					<Input placeholder="Nhập tên dự án" allowClear />
				</Form.Item>

				<Form.Item name="description" label="Mô tả">
					<Input.TextArea
						placeholder="Mô tả ngắn về dự án"
						autoSize={{ minRows: 3, maxRows: 6 }}
						showCount
						maxLength={300}
					/>
				</Form.Item>

				<Form.Item label="Ảnh đại diện">
					<ImgCrop rotationSlider aspect={1}>
						<Upload
							listType="picture-card"
							fileList={fileList}
							maxCount={1}
							beforeUpload={() => false}
							onChange={({ fileList: list }) => setFileList(list)}
						>
							{fileList.length >= 1 ? null : (
								<div>
									<PlusOutlined />
									<div style={{ marginTop: 8 }}>Tải lên</div>
								</div>
							)}
						</Upload>
					</ImgCrop>
					<div className={styles.uploadHint}>
						Ảnh vuông (tỉ lệ 1:1), tối đa 1 ảnh.
					</div>
				</Form.Item>
			</Form>
		</Drawer>
	);
}
