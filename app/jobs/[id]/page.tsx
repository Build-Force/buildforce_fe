import { JobDetailClient } from "@/components/jobs/JobDetailClient";

export async function generateStaticParams() {
  return [];
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  return <JobDetailClient jobId={params.id} />;
}

