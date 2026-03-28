'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import ServiceForm from '@/components/services/ServiceForm';
import type { Service, ServiceFormData } from '@/types';

export default function AdminEditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api
      .get<{ service: Service }>(`/services/${id}`)
      .then((data) => setService(data.service))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: ServiceFormData) => {
    await api.put<{ service: Service }>(`/services/${id}`, data);
    router.push(`/admin/services/${id}`);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-96 rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="rounded-lg bg-white p-12 text-center text-gray-500 shadow-sm">
        Service not found.
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Service: {service.name}</h1>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <ServiceForm
          initialData={service}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/admin/services/${id}`)}
          submitLabel="Update Service"
        />
      </div>
    </div>
  );
}
