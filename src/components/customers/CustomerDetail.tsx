'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button, Card, PageHeader } from '@/components/ui';
import type { Customer } from '@/types';

interface CustomerDetailProps {
  customerId: string;
  basePath: string;
}

export default function CustomerDetail({ customerId, basePath }: CustomerDetailProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    api
      .get<{ customer: Customer }>(`/customers/${customerId}`)
      .then((data) => setCustomer(data.customer))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [customerId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    setDeleting(true);
    try {
      await api.delete(`/customers/${customerId}`);
      router.push(basePath);
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-64 rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (!customer) {
    return (
      <Card padding="lg">
        <p className="text-center text-gray-500">Customer not found.</p>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title={customer.name}
        backLink={{ href: basePath, label: 'Back to Customers' }}
        actions={
          <>
            <Link href={`${basePath}/${customer.id}/edit`}>
              <Button variant="primary" size="sm">Edit</Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={handleDelete} loading={deleting}>
              Delete
            </Button>
          </>
        }
      />

      <Card>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Phone</dt>
            <dd className="mt-1 text-sm text-gray-900">{customer.phone}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{customer.email || '-'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Address</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {customer.address}
              {customer.city && `, ${customer.city}`}
              {customer.state && `, ${customer.state}`}
              {customer.zip_code && ` ${customer.zip_code}`}
            </dd>
          </div>
          {customer.notes && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-line text-sm text-gray-900">{customer.notes}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(customer.created_at).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
