'use client';

import { useEffect, useState } from 'react';
import { portalApi } from '@/lib/portal-api';
import { Card, Badge, PageHeader } from '@/components/ui';
import type { PortalServiceRequest } from '@/types/portal';
import type { PaginatedResponse } from '@/types';
import { Calendar, MapPin, Clock } from 'lucide-react';

const REQUEST_STATUS_VARIANTS: Record<string, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  declined: 'danger',
};

const REQUEST_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  declined: 'Declined',
};

export default function PortalRequestsPage() {
  const [requests, setRequests] = useState<PortalServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portalApi.get<PaginatedResponse<PortalServiceRequest>>('/service-requests', undefined, { skipCache: true })
      .then((res) => setRequests(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="My Requests" subtitle="Track the status of your service requests" />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-600 border-t-transparent" />
        </div>
      ) : requests.length === 0 ? (
        <Card padding="lg">
          <p className="text-center text-gray-500">No service requests yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id} padding="md">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{req.service.name}</span>
                    <Badge variant={REQUEST_STATUS_VARIANTS[req.status]}>
                      {REQUEST_STATUS_LABELS[req.status]}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-sm text-gray-600">{req.description}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {req.preferred_date}
                  </span>
                  {req.preferred_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {req.preferred_time}
                    </span>
                  )}
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{req.address}</span>
                  </span>
                </div>

                {req.admin_notes && (
                  <div className="mt-2 rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Response</p>
                    <p className="text-sm text-gray-700">{req.admin_notes}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
