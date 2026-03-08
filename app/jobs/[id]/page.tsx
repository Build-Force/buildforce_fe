import { JobDetailClient } from "@/components/jobs/JobDetailClient";
import { JOBS as MOCK_JOBS } from "@/data/mockData";

// With `output: 'export'`, ONLY the IDs returned here can be visited.
// At build time the API is often unavailable, so we only use mock IDs to avoid ECONNREFUSED.
export async function generateStaticParams() {
  const mockParams = (Array.isArray(MOCK_JOBS) ? MOCK_JOBS : []).map((job: any) => ({
    id: String(job.id),
  }));
  return mockParams;
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobDetailClient jobId={id} />;
}

