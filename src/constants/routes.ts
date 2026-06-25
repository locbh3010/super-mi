export const ROUTES = {
	HOME: "/",

	AUTH: {
		LOGIN: "/auth/login",
		REGISTER: "/auth/register",
		FORGOT_PASSWORD: "/auth/forgot-password",
		OAUTH: "/auth/oauth",
	},

	DASHBOARD: {
		ROOT: "/dashboard",
		PROJECTS: "/dashboard/projects",
		PROJECT: "/dashboard/projects/$id",
	},
} as const;
