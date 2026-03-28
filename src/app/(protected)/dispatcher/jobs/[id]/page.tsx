'use client';

import { use } from 'react';
import JobDetail from '@/components/jobs/JobDetail';

export default function DispatcherJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <JobDetail jobId={id} basePath="/dispatcher/jobs" canAssign />;
}
