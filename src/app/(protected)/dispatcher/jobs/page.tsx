'use client';

import { api } from '@/lib/api';
import JobList from '@/components/jobs/JobList';

export default function DispatcherJobsPage() {
  const handleStatusUpdate = async (jobId: number, status: string) => {
    await api.patch(`/service-jobs/${jobId}/status`, { status });
  };

  return (
    <JobList
      basePath="/dispatcher/jobs"
      title="Jobs"
      onStatusUpdate={handleStatusUpdate}
    />
  );
}
