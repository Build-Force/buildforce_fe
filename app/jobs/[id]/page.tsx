import { JobDetailClient } from "@/components/jobs/JobDetailClient";
import { JOBS as MOCK_JOBS } from "@/data/mockData";
import api from "@/utils/api";

// With `output: 'export'`, ONLY the IDs returned here
// can be visited (e.g. /jobs/<_id from API>).
export async function generateStaticParams() {
  try {
    const res = await api.get("/api/jobs");
    const items = res.data?.data || [];

    const apiParams = Array.isArray(items)
      ? items.map((job: any) => ({ id: String(job._id) }))
      : [];

    const mockParams = (Array.isArray(MOCK_JOBS) ? MOCK_JOBS : []).map((job: any) => ({
      id: String(job.id),
    }));

    const seen = new Set<string>();
    return [...apiParams, ...mockParams].filter((p) => {
      if (!p?.id) return false;
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  } catch (error) {
    console.error("Failed to generate static params for jobs/[id]", error);
    return (Array.isArray(MOCK_JOBS) ? MOCK_JOBS : []).map((job: any) => ({
      id: String(job.id),
    }));
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

