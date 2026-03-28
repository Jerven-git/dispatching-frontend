'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Services</h1>
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">All Services</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          <Link
            href={`${basePath}/create`}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Service
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-lg bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center text-gray-500 shadow-sm">
          No services found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service) => (
            <Link
              key={service.id}
              href={`${basePath}/${service.id}`}
              className="block rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
