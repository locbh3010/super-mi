"use client";

import { getQueryClient } from "@/configs/query-client";
import useTheme from "@/themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { App } from "antd";
import { StyleProvider, ThemeProvider, extractStaticStyle } from "antd-style";
import type { MessageInstance } from "antd/es/message/interface";
import type { ModalStaticFunctions } from "antd/es/modal/confirm";
import type { NotificationInstance } from "antd/es/notification/interface";
import { useServerInsertedHTML } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useMemo, useRef } from "react";
import type { ProvidersProps } from "./types";

let message: MessageInstance;
let notification: NotificationInstance;
let modal: Omit<ModalStaticFunctions, "warn">;

const AntDesignContext = () => {
	const staticFunction = App.useApp();

	// eslint-disable-next-line react-hooks/globals
	message = staticFunction.message;
	// eslint-disable-next-line react-hooks/globals
	modal = staticFunction.modal;
	// eslint-disable-next-line react-hooks/globals
	notification = staticFunction.notification;
	return null;
};

export { message, modal, notification };

export function Providers({ children }: ProvidersProps) {
	const queryClient = useMemo(() => getQueryClient(), []);
	const configProps = useTheme();

	const isInsert = useRef(false);

	useServerInsertedHTML(() => {
		if (isInsert.current) return;

		isInsert.current = true;

		const styles = extractStaticStyle().map(item => item.style);

		return <>{styles}</>;
	});

	return (
		<ThemeProvider {...configProps}>
			<StyleProvider cache={extractStaticStyle.cache}>
				<App>
					<AntDesignContext />
					<QueryClientProvider client={queryClient}>
						<NuqsAdapter>{children}</NuqsAdapter>
					</QueryClientProvider>
				</App>
			</StyleProvider>
		</ThemeProvider>
	);
}
