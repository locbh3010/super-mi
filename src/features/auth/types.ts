import { Tables } from "@/types/database";

export interface LoginFormValues {
	email: string;
	password: string;
	remember: boolean;
}

export type LoggedUser = Tables<"profiles">;

export interface RegisterFormValues {
	email: string;
	password: string;
	confirmPassword: string;
	terms: boolean;
}
