"use client";

import {
	BellOutlined,
	DeleteOutlined,
	InfoCircleOutlined,
	LockOutlined,
} from "@ant-design/icons";
import {
	Button,
	Form,
	Grid,
	Input,
	Radio,
	Switch,
	Tabs,
	Typography,
} from "antd";
import { useProjectDetailStyles } from "../../styles";

const { useBreakpoint } = Grid;

function SettingRow({
	title,
	description,
	control,
}: {
	title: string;
	description: string;
	control: React.ReactNode;
}) {
	const { styles } = useProjectDetailStyles();
	return (
		<div className={styles.settingRow}>
			<div className={styles.settingRowInfo}>
				<span className={styles.settingRowTitle}>{title}</span>
				<span className={styles.settingRowDesc}>{description}</span>
			</div>
			{control}
		</div>
	);
}

function GeneralSettings() {
	const { styles } = useProjectDetailStyles();
	return (
		<div className={styles.settingsSection}>
			<h3 className={styles.settingsSectionTitle}>Thông tin chung</h3>
			<p className={styles.settingsSectionDesc}>
				Cập nhật thông tin cơ bản của dự án.
			</p>
			<Form layout="vertical" requiredMark={false}>
				<Form.Item label="Tên dự án">
					<Input placeholder="Nhập tên dự án" />
				</Form.Item>
				<Form.Item label="Mô tả">
					<Input.TextArea
						rows={4}
						placeholder="Mô tả ngắn về dự án"
					/>
				</Form.Item>
				<Form.Item label="Đường dẫn ảnh đại diện">
					<Input placeholder="https://..." />
				</Form.Item>
				<Form.Item>
					<Button type="primary">Lưu thay đổi</Button>
				</Form.Item>
			</Form>
		</div>
	);
}

function AccessSettings() {
	const { styles } = useProjectDetailStyles();
	return (
		<div className={styles.settingsSection}>
			<h3 className={styles.settingsSectionTitle}>Quyền & Truy cập</h3>
			<p className={styles.settingsSectionDesc}>
				Kiểm soát ai có thể xem và tương tác với dự án.
			</p>
			<Form layout="vertical">
				<Form.Item label="Chế độ hiển thị">
					<Radio.Group defaultValue="private">
						<Radio.Button value="private">Riêng tư</Radio.Button>
						<Radio.Button value="team">Nhóm</Radio.Button>
						<Radio.Button value="public">Công khai</Radio.Button>
					</Radio.Group>
				</Form.Item>
			</Form>
			<SettingRow
				title="Cho phép thành viên mời người khác"
				description="Thành viên có thể gửi lời mời tham gia dự án."
				control={<Switch defaultChecked />}
			/>
			<SettingRow
				title="Yêu cầu phê duyệt khi tham gia"
				description="Quản trị viên phải duyệt yêu cầu tham gia mới."
				control={<Switch />}
			/>
			<SettingRow
				title="Cho phép khách xem"
				description="Người không phải thành viên có thể xem ở chế độ chỉ đọc."
				control={<Switch />}
			/>
		</div>
	);
}

function NotificationSettings() {
	const { styles } = useProjectDetailStyles();
	return (
		<div className={styles.settingsSection}>
			<h3 className={styles.settingsSectionTitle}>Thông báo</h3>
			<p className={styles.settingsSectionDesc}>
				Chọn loại thông báo bạn muốn nhận.
			</p>
			<SettingRow
				title="Công việc được giao"
				description="Nhận thông báo khi bạn được giao công việc mới."
				control={<Switch defaultChecked />}
			/>
			<SettingRow
				title="Bình luận & nhắc đến"
				description="Thông báo khi có người nhắc đến bạn."
				control={<Switch defaultChecked />}
			/>
			<SettingRow
				title="Cập nhật trạng thái"
				description="Thông báo khi trạng thái công việc thay đổi."
				control={<Switch />}
			/>
			<SettingRow
				title="Tóm tắt hàng tuần qua email"
				description="Nhận email tổng hợp hoạt động dự án mỗi tuần."
				control={<Switch defaultChecked />}
			/>
		</div>
	);
}

function DangerSettings() {
	const { styles } = useProjectDetailStyles();
	return (
		<div className={styles.settingsSection}>
			<h3 className={styles.settingsSectionTitle}>Vùng nguy hiểm</h3>
			<p className={styles.settingsSectionDesc}>
				Các thao tác không thể hoàn tác.
			</p>
			<div className={styles.dangerZone}>
				<SettingRow
					title="Lưu trữ dự án"
					description="Ẩn dự án khỏi danh sách hoạt động."
					control={<Button>Lưu trữ</Button>}
				/>
				<SettingRow
					title="Xóa dự án"
					description="Xóa vĩnh viễn dự án và toàn bộ dữ liệu."
					control={
						<Button danger icon={<DeleteOutlined />}>
							Xóa dự án
						</Button>
					}
				/>
			</div>
		</div>
	);
}

export function SettingsTab() {
	const { styles } = useProjectDetailStyles();
	const screens = useBreakpoint();
	const isMobile = !screens.md;

	return (
		<Tabs
			className={styles.settingsTabs}
			tabPlacement={isMobile ? "top" : "start"}
			defaultActiveKey="general"
			items={[
				{
					key: "general",
					label: (
						<Typography.Text>
							<InfoCircleOutlined /> Thông tin chung
						</Typography.Text>
					),
					children: <GeneralSettings />,
				},
				{
					key: "access",
					label: (
						<Typography.Text>
							<LockOutlined /> Quyền & Truy cập
						</Typography.Text>
					),
					children: <AccessSettings />,
				},
				{
					key: "notifications",
					label: (
						<Typography.Text>
							<BellOutlined /> Thông báo
						</Typography.Text>
					),
					children: <NotificationSettings />,
				},
				{
					key: "danger",
					label: (
						<Typography.Text type="danger">
							<DeleteOutlined /> Vùng nguy hiểm
						</Typography.Text>
					),
					children: <DangerSettings />,
				},
			]}
		/>
	);
}
