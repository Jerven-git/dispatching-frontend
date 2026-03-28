'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import JobForm from '@/components/jobs/JobForm';
import type { ServiceJob, ServiceJobFormData } from '@/types';

export default function AdminEditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [job, setJob] = useState<ServiceJob | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api
      .get<{ job: ServiceJob }>(`/service-jobs/${id}`)
      .then((data) => setJob(data.job))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: ServiceJobFormData) => {
    await api.put<{ job: ServiceJob }>(`/service-jobs/${id}`, data);
    router.push(`/admin/jobs/${id}`);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-96 rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rounded-lg bg-white p-12 text-center text-gray-500 shadow-sm">
        Job not found.
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Job: {job.reference_number}</h1>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <JobForm
          initialData={job}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/admin/jobs/${id}`)}
          submitLabel="Update Job"
        />
      </div>
    </div>
  );
}
