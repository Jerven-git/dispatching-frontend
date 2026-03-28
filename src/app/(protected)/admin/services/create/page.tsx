'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import ServiceForm from '@/components/services/ServiceForm';
import type { ServiceFormData, Service } from '@/types';

export default function AdminCreateServicePage() {
  const router = useRouter();

  const handleSubmit = async (data: ServiceFormData) => {
    await api.post<{ service: Service }>('/services', data);
    router.push('/admin/services');
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Add Service</h1>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <ServiceForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/admin/services')}
          submitLabel="Create Service"
        />
      </div>
    </div>
  );
}
