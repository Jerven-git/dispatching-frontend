'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Service, PaginatedResponse } from '@/types';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<PaginatedResponse<Service>>('/services')
      .then((data) => setServices(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Services</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center text-gray-500 shadow-sm">
          No services found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="rounded-lg bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {service.name}
                </h3>
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
                <p className="mt-2 text-sm text-gray-600">{service.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span className="font-medium text-gray-900">
                  ${parseFloat(service.base_price).toFixed(2)}
                </span>
                {service.estimated_duration_minutes && (
                  <span>{service.estimated_duration_minutes} min</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
