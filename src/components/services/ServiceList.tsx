'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Select, Button, Card, Badge, PageHeader } from '@/components/ui';
import type { Service, PaginatedResponse } from '@/types';

interface ServiceListProps {
  basePath: string;
}

export default function ServiceList({ basePath }: ServiceListProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { per_page: '100' };
    if (filter === 'active') params.active_only = '1';

    api
      .get<PaginatedResponse<Service>>('/services', params)
      .then((data) => setServices(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  const filtered = filter === 'inactive'
    ? services.filter((s) => !s.is_active)
    : services;

  return (
    <div>
      <PageHeader
        title="Services"
        actions={
          <>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
              options={[
                { value: 'all', label: 'All Services' },
                { value: 'active', label: 'Active Only' },
                { value: 'inactive', label: 'Inactive Only' },
              ]}
            />
            <Link href={`${basePath}/create`}>
              <Button variant="primary">Add Service</Button>
            </Link>
          </>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <div className="h-28 animate-pulse rounded bg-gray-200" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card padding="lg">
          <p className="text-center text-gray-500">No services found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service) => (
            <Link key={service.id} href={`${basePath}/${service.id}`}>
              <Card variant="interactive">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                  <Badge variant={service.is_active ? 'success' : 'danger'}>
                    {service.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {service.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">{service.description}</p>
                )}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span className="font-medium text-gray-900">
                    ${parseFloat(service.base_price).toFixed(2)}
                  </span>
                  {service.estimated_duration_minutes && (
                    <span>{service.estimated_duration_minutes} min</span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
