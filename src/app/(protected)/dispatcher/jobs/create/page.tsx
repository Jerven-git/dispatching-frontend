'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import JobForm from '@/components/jobs/JobForm';
import type { ServiceJobFormData, ServiceJob } from '@/types';

export default function DispatcherCreateJobPage() {
  const router = useRouter();

  const handleSubmit = async (data: ServiceJobFormData) => {
    await api.post<{ job: ServiceJob }>('/service-jobs', data);
    router.push('/dispatcher/jobs');
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Create Job</h1>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <JobForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/dispatcher/jobs')}
          submitLabel="Create Job"
        />
      </div>
    </div>
  );
}
