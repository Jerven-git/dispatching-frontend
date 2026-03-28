'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
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
      <div className="rounded-lg bg-white p-12 text-center text-gray-500 shadow-sm">
        Service not found.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href={basePath} className="text-sm text-blue-600 hover:text-blue-800">
            &larr; Back to Services
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-2xl font-bold">{service.name}</h1>
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                service.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {service.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`${basePath}/${service.id}/edit`}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
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
      </div>
    </div>
  );
}
