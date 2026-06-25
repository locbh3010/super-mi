import "antd/dist/reset.css";
import { Google_Sans } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Providers } from "@/components/providers/Providers";

const fontSans = Google_Sans({
	weight: ["400", "500", "700"],
	subsets: ["vietnamese", "latin"],
	variable: "--font-google-sans",
	display: "swap",
	fallback: [
		"system-ui",
		"-apple-system",
		"BlinkMacSystemFont",
		"Segoe UI",
		"Roboto",
		"Helvetica Neue",
		"Arial",
		"sans-serif",
	],
	adjustFontFallback: true,
});

export const metadata = {
	title: "Org AI — Nền tảng AI doanh nghiệp",
	description:
		"Quản lý mô hình AI, tinh chỉnh và hạ tầng thông minh trên một nền tảng duy nhất.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="vi" className={fontSans.variable}>
			<body>
				<AntdRegistry>
					<Providers>{children}</Providers>
				</AntdRegistry>
			</body>
		</html>
	);
}
