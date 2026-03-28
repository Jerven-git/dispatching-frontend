'use client';

import CustomerList from '@/components/customers/CustomerList';

export default function AdminCustomersPage() {
  return <CustomerList basePath="/admin/customers" />;
}
