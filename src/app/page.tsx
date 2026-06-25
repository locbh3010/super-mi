import { ROUTES } from "@/constants/routes";
import { redirect } from "next/navigation";

function page() {
	redirect(ROUTES.AUTH.LOGIN);
}

export default page;
