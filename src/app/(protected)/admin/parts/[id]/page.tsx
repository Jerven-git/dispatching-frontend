'use client';

import { use } from 'react';
import PartDetail from '@/components/parts/PartDetail';

export default function PartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PartDetail partId={id} basePath="/admin/parts" />;
}
