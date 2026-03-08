import { JobDetailClient } from "@/components/jobs/JobDetailClient";
import api from "@/utils/api";

export async function generateStaticParams() {
  try {
    const res = await api.get("/api/jobs");
    const items = res.data?.data || [];
    return Array.isArray(items) ? items.map((job: any) => ({ id: String(job._id) })) : [];
  } catch (error) {
    console.error("Failed to generate static params for jobs/[id]", error);
    return [];
  }
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobDetailClient jobId={id} />;
}

