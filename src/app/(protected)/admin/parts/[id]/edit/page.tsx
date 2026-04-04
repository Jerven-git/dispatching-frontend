'use client';

import { use } from 'react';
import PartForm from '@/components/parts/PartForm';

export default function EditPartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PartForm partId={id} basePath="/admin/parts" />;
}
