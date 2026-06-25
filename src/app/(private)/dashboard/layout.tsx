import React from "react";
import { DashboardLayout } from "@/layouts/dashboard";

export default function Layout({ children }: React.PropsWithChildren) {
	return <DashboardLayout>{children}</DashboardLayout>;
}
