'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { portalApi } from '@/lib/portal-api';
import { Card, Badge, Pagination, PageHeader } from '@/components/ui';
import { getStatusBadgeVariant, getPriorityBadgeVariant } from '@/components/ui/Badge';
import type { PortalJob } from '@/types/portal';
import type { PaginatedResponse, JobStatus } from '@/types';
import { Calendar, MapPin, User, ChevronRight } from 'lucide-react';

const STATUS_LABELS: Record<JobStatus, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  on_the_way: 'On the Way',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function PortalJobsPage() {
  const [jobs, setJobs] = useState<PortalJob[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchJobs = async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (status) params.status = status;
      const res = await portalApi.get<PaginatedResponse<PortalJob>>('/jobs', params, { skipCache: true });
      setJobs(res.data);
      setMeta(res.meta);
    } catch {
      // handled by API client
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="space-y-6">
      <PageHeader title="My Jobs" subtitle="View all your service jobs and their status" />

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['', 'pending', 'assigned', 'on_the_way', 'in_progress', 'completed', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              status === s
                ? 'bg-accent-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {s ? STATUS_LABELS[s as JobStatus] : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-600 border-t-transparent" />
        </div>
      ) : jobs.length === 0 ? (
        <Card padding="lg">
          <p className="text-center text-gray-500">No jobs found.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link key={job.id} href={`/portal/jobs/${job.id}`}>
              <Card variant="interactive" padding="md" className="mb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{job.reference_number}</span>
                      <Badge variant={getStatusBadgeVariant(job.status)}>
                        {STATUS_LABELS[job.status]}
                      </Badge>
                      <Badge variant={getPriorityBadgeVariant(job.priority)}>
                        {job.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{job.service.name}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {job.scheduled_date}
                        {job.scheduled_time && ` at ${job.scheduled_time}`}
                      </span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{job.address}</span>
                      </span>
                      {job.technician && (
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {job.technician.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 shrink-0 ml-2" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {meta.last_page > 1 && (
        <Pagination
          currentPage={meta.current_page}
          totalPages={meta.last_page}
          totalItems={meta.total}
          itemsPerPage={meta.per_page}
          onPageChange={fetchJobs}
        />
      )}
    </div>
  );
}
