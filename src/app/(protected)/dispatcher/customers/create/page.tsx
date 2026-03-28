'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import CustomerForm from '@/components/customers/CustomerForm';
import type { CustomerFormData, Customer } from '@/types';

export default function DispatcherCreateCustomerPage() {
  const router = useRouter();

  const handleSubmit = async (data: CustomerFormData) => {
    await api.post<{ customer: Customer }>('/customers', data);
    router.push('/dispatcher/customers');
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Add Customer</h1>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <CustomerForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/dispatcher/customers')}
          submitLabel="Create Customer"
        />
      </div>
    </div>
  );
}
