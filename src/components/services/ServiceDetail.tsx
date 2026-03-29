'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button, Card, Badge, PageHeader } from '@/components/ui';
import type { Service } from '@/types';

interface ServiceDetailProps {
  serviceId: string;
  basePath: string;
}

export default function ServiceDetail({ serviceId, basePath }: ServiceDetailProps) {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    api
      .get<{ service: Service }>(`/services/${serviceId}`)
      .then((data) => setService(data.service))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [serviceId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    setDeleting(true);
    try {
      await api.delete(`/services/${serviceId}`);
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
        <div className="h-48 rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (!service) {
    return (
      <Card padding="lg">
        <p className="text-center text-gray-500">Service not found.</p>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title={service.name}
        backLink={{ href: basePath, label: 'Back to Services' }}
        actions={
          <>
            <Badge variant={service.is_active ? 'success' : 'danger'}>
              {service.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <Link href={`${basePath}/${service.id}/edit`}>
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
            <dt className="text-sm font-medium text-gray-500">Base Price</dt>
            <dd className="mt-1 text-sm text-gray-900">
              ${parseFloat(service.base_price).toFixed(2)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Estimated Duration</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {service.estimated_duration_minutes
                ? `${service.estimated_duration_minutes} minutes`
                : '-'}
            </dd>
          </div>
          {service.description && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 whitespace-pre-line text-sm text-gray-900">
                {service.description}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(service.created_at).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
