import { ROUTES } from "@/constants/routes";

export const AUTH_ROUTES = {
	LOGIN: ROUTES.AUTH.LOGIN,
	REGISTER: ROUTES.AUTH.REGISTER,
	FORGOT_PASSWORD: ROUTES.AUTH.FORGOT_PASSWORD,
	OAUTH: ROUTES.AUTH.OAUTH,
} as const;

export const PANEL_FEATURES = [
	{
		icon: "RobotOutlined",
		text: "Access cutting-edge AI models & agents",
	},
	{
		icon: "DatabaseOutlined",
		text: "Manage knowledge bases & embeddings",
	},
	{
		icon: "LineChartOutlined",
		text: "Real-time analytics & cost tracking",
	},
] as const;
