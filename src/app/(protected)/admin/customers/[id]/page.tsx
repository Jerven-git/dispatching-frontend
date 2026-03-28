'use client';

import { use } from 'react';
import CustomerDetail from '@/components/customers/CustomerDetail';

export default function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <CustomerDetail customerId={id} basePath="/admin/customers" />;
}
