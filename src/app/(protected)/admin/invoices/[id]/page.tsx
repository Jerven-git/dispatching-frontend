'use client';

import { use } from 'react';
import InvoiceDetail from '@/components/invoices/InvoiceDetail';

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <InvoiceDetail invoiceId={id} basePath="/admin/invoices" />;
}
