'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import CustomerForm from '@/components/customers/CustomerForm';
import type { Customer, CustomerFormData } from '@/types';

export default function AdminEditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api
      .get<{ customer: Customer }>(`/customers/${id}`)
      .then((data) => setCustomer(data.customer))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: CustomerFormData) => {
    await api.put<{ customer: Customer }>(`/customers/${id}`, data);
    router.push(`/admin/customers/${id}`);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-96 rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="rounded-lg bg-white p-12 text-center text-gray-500 shadow-sm">
        Customer not found.
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Customer: {customer.name}</h1>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <CustomerForm
          initialData={customer}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/admin/customers/${id}`)}
          submitLabel="Update Customer"
        />
      </div>
    </div>
  );
}
