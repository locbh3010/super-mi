export interface ScrollAreaProps {
	children: React.ReactNode;
	/** Height of the scroll area. Defaults to "100%" */
	height?: string | number;
	/** Width of the scroll area. Defaults to "100%" */
	width?: string | number;
	/** Scrollbar visibility: "auto" | "always" | "scroll" | "hover". Defaults to "hover" */
	type?: ScrollAreaPrimitive.ScrollAreaProps["type"];
	/** Hide scrollbar delay in ms (used when type="scroll"). Defaults to 600 */
	scrollHideDelay?: number;
	className?: string;
	style?: React.CSSProperties;
}
