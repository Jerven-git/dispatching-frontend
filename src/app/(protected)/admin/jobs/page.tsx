'use client';

import { api } from '@/lib/api';
import JobList from '@/components/jobs/JobList';

export default function AdminJobsPage() {
  const handleStatusUpdate = async (jobId: number, status: string) => {
    await api.patch(`/service-jobs/${jobId}/status`, { status });
  };

  return (
    <JobList
      basePath="/admin/jobs"
      title="All Jobs"
      onStatusUpdate={handleStatusUpdate}
    />
  );
}
