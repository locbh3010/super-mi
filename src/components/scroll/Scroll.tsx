import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import React from "react";
import { useScrollStyles } from "./styles";
import { ScrollAreaProps } from "./types";

const ScrollArea: React.FC<ScrollAreaProps> = ({
	children,
	height = "100%",
	width = "100%",
	type = "hover",
	scrollHideDelay = 600,
	className,
	style,
}) => {
	const { styles, cx } = useScrollStyles();

	return (
		<ScrollAreaPrimitive.Root
			type={type}
			scrollHideDelay={scrollHideDelay}
			className={cx(styles.root, className)}
			style={{ height, width, ...style }}
		>
			<ScrollAreaPrimitive.Viewport className={styles.viewport}>
				{children}
			</ScrollAreaPrimitive.Viewport>

			<ScrollAreaPrimitive.Scrollbar
				className={styles.scrollbar}
				orientation="vertical"
			>
				<ScrollAreaPrimitive.Thumb className={styles.thumb} />
			</ScrollAreaPrimitive.Scrollbar>

			<ScrollAreaPrimitive.Scrollbar
				className={styles.scrollbar}
				orientation="horizontal"
			>
				<ScrollAreaPrimitive.Thumb className={styles.thumb} />
			</ScrollAreaPrimitive.Scrollbar>

			<ScrollAreaPrimitive.Corner className={styles.corner} />
		</ScrollAreaPrimitive.Root>
	);
};

export default ScrollArea;
