'use client';

import { use } from 'react';
import ServiceDetail from '@/components/services/ServiceDetail';

export default function AdminServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ServiceDetail serviceId={id} basePath="/admin/services" />;
}
