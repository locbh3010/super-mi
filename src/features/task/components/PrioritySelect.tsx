import type { SelectProps } from "antd";
import { Select } from "antd";
import { TASK_PRIORITY_OPTIONS } from "../constants";

type PriorityOption = (typeof TASK_PRIORITY_OPTIONS)[number];

type PrioritySelectProps = Omit<SelectProps, "options">;

const renderPriorityLabel = (label: React.ReactNode, color: string) => (
	<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
		<span
			style={{
				display: "inline-block",
				width: 8,
				height: 8,
				borderRadius: "50%",
				backgroundColor: color,
				flexShrink: 0,
			}}
		/>
		<span>{label}</span>
	</span>
);

const priorityOptionRender: SelectProps["optionRender"] = option => {
	const data = option.data as PriorityOption;
	return renderPriorityLabel(data.label, data.color);
};

const priorityLabelRender: SelectProps["labelRender"] = option => {
	const data = TASK_PRIORITY_OPTIONS.find(item => item.value === option.value);
	if (!data) return option.label;
	return renderPriorityLabel(data.label, data.color);
};

export function PrioritySelect(props: PrioritySelectProps) {
	return (
		<Select
			options={TASK_PRIORITY_OPTIONS}
			optionLabelProp="label"
			optionRender={priorityOptionRender}
			labelRender={priorityLabelRender}
			{...props}
		/>
	);
}
