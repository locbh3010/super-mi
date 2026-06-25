import { getQueryClient } from "@/configs/query-client";
import { ProjectPage } from "@/features/project/pages/ProjectPage";
import { projectByIdQueryOptions } from "@/features/project/query-options";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";

export default async function ProjectDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const qc = getQueryClient();
	const options = projectByIdQueryOptions(id);

	await qc.prefetchQuery(options);
	const project = qc.getQueryData(options.queryKey);

	// Không có quyền truy cập hoặc dự án không tồn tại → 404.
	if (!project) notFound();

	return (
		<HydrationBoundary state={dehydrate(qc)}>
			<ProjectPage projectId={id} />
		</HydrationBoundary>
	);
}
