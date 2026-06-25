"use client";

import { Avatar, Select, Spin, Tag, Typography } from "antd";
import type { SelectProps } from "antd";
import { useMemo } from "react";
import { useInfiniteFetchMembers } from "../hooks/use-fetch-members";

interface MemberSelectProps {
	/** Danh sách user_id đã chọn. */
	value?: string[];
	/** Callback khi thay đổi lựa chọn. */
	onChange?: (value: string[]) => void;
	/** Class wrapper (để dùng style tolbar). */
	className?: string;
	placeholder?: string;
	projectId?: string;
}

/**
 * Ô chọn nhiều thành viên có search + scroll loadmore.
 * Dùng infinite query của TanStack Query qua `useFetchMembers`.
 */
export function MemberSelect({
	value,
	onChange,
	className,
	placeholder = "Lọc theo thành viên...",
	projectId,
}: MemberSelectProps) {
	const {
		members,
		searchInput,
		onSearch,
		onPopupScroll,
		isLoading,
		isFetchingNextPage,
	} = useInfiniteFetchMembers(projectId);

	// Stable map survives search changes — accumulate all seen members.
	const memberMap = useMemo(() => {
		const map = new Map<string, (typeof members)[number]>();
		for (const m of members) map.set(m.id, m);
		return map;
	}, [members]);

	const options = members.map(member => ({
		value: member.id,
		label: member.display_name || member.email,
		member,
	}));

	const tagRender: SelectProps["tagRender"] = ({ value: id, label, closable, onClose }) => {
		const member = memberMap.get(id as string);
		const name = member?.display_name || member?.email || String(label);
		const email = member?.email;
		const avatarSrc = member?.avatar_url;
		return (
			<Tag
				closable={closable}
				onClose={onClose}
				style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 6px", marginBottom: 2, marginRight: 2 }}
			>
				<Avatar size={16} src={avatarSrc}>
					{name.charAt(0).toUpperCase()}
				</Avatar>
				<span style={{ lineHeight: 1 }}>
					<span style={{ display: "block", fontSize: 12 }}>{name}</span>
					{email && (
						<Typography.Text type="secondary" style={{ display: "block", fontSize: 11 }}>
							{email}
						</Typography.Text>
					)}
				</span>
			</Tag>
		);
	};

	return (
		<Select
			className={className}
			mode="multiple"
			allowClear
			showSearch
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			filterOption={false}
			searchValue={searchInput}
			onSearch={onSearch}
			onPopupScroll={onPopupScroll}
			loading={isLoading}
			notFoundContent={isLoading ? <Spin size="small" /> : undefined}
			options={options}
			tagRender={tagRender}
			optionRender={option => {
				const member = option.data.member;
				return (
					<Avatar.Group>
						<Avatar size="small" src={member.avatar_url}>
							{(member.display_name || member.email)?.charAt(0).toUpperCase()}
						</Avatar>
						<div>
							<span style={{ marginLeft: 16 }}>
								{member.display_name || member.email}
							</span>
							<Typography.Paragraph
								type="secondary"
								style={{ marginLeft: 16, fontSize: 12, fontWeight: 400 }}
							>
								{member.email}
							</Typography.Paragraph>
						</div>
					</Avatar.Group>
				);
			}}
			popupRender={menu => (
				<>
					{menu}
					{isFetchingNextPage && (
						<div style={{ textAlign: "center", padding: 8 }}>
							<Spin size="small" />
						</div>
					)}
				</>
			)}
		/>
	);
}
