import { ROUTES } from "@/constants/routes";
import { getLoggedUser } from "@/features/auth/services";
import { redirect } from "next/navigation";

async function layout({ children }: any) {
	const user = await getLoggedUser();

	if (!user) redirect(ROUTES.AUTH.LOGIN);

	return children;
}

export default layout;
