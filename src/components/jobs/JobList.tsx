'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  statusColors,
  statusLabels,
  priorityColors,
  priorityLabels,
  JOB_STATUSES,
  JOB_PRIORITIES,
} from '@/lib/job-constants';
import type { ServiceJob, PaginatedResponse, JobStatus, JobPriority } from '@/types';

interface JobListProps {
  basePath: string;
  title?: string;
  apiEndpoint?: string;
  showTechnician?: boolean;
  showCreateButton?: boolean;
  availableStatuses?: JobStatus[];
  onStatusUpdate?: (jobId: number, status: string) => Promise<void>;
}

export default function JobList({
  basePath,
  title = 'Jobs',
  apiEndpoint = '/service-jobs',
  showTechnician = true,
  showCreateButton = true,
  availableStatuses = JOB_STATUSES,
  onStatusUpdate,
}: JobListProps) {
  const [jobs, setJobs] = useState<ServiceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginatedResponse<ServiceJob>['meta'] | null>(null);

  const fetchJobs = useCallback(
    (params: { status: string; priority: string; search: string; page: number }) => {
      setLoading(true);
      const queryParams: Record<string, string> = { page: String(params.page) };
      if (params.status) queryParams.status = params.status;
      if (params.priority) queryParams.priority = params.priority;
      if (params.search) queryParams.search = params.search;

      api
        .get<PaginatedResponse<ServiceJob>>(apiEndpoint, queryParams)
        .then((data) => {
          setJobs(data.data);
          setMeta(data.meta);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    },
    [apiEndpoint]
  );

  // Debounced search + immediate filter changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchJobs({ status: statusFilter, priority: priorityFilter, search, page: 1 });
    }, 300);
    return () => clearTimeout(timeout);
  }, [statusFilter, priorityFilter, search, fetchJobs]);

  useEffect(() => {
    if (page > 1)
      fetchJobs({ status: statusFilter, priority: priorityFilter, search, page });
  }, [page, statusFilter, priorityFilter, search, fetchJobs]);

  const handleStatusUpdate = async (jobId: number, status: string) => {
    if (onStatusUpdate) {
      await onStatusUpdate(jobId, status);
      fetchJobs({ status: statusFilter, priority: priorityFilter, search, page });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search ref# or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm w-52"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            {availableStatuses.map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All Priorities</option>
            {JOB_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {priorityLabels[p]}
              </option>
            ))}
          </select>
          {showCreateButton && (
            <Link
              href={`${basePath}/create`}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Create Job
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center text-gray-500 shadow-sm">
          No jobs found.
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Ref #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Service
                  </th>
                  {showTechnician && (
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Technician
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <Link
                        href={`${basePath}/${job.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {job.reference_number}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {job.customer?.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {job.service?.name}
                    </td>
                    {showTechnician && (
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                        {job.technician?.name || (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </td>
                    )}
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {job.scheduled_date}
                      {job.scheduled_time && ` ${job.scheduled_time}`}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          priorityColors[job.priority]
                        }`}
                      >
                        {priorityLabels[job.priority]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          statusColors[job.status]
                        }`}
                      >
                        {statusLabels[job.status]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm space-x-2">
                      <Link
                        href={`${basePath}/${job.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </Link>
                      {onStatusUpdate &&
                        job.status !== 'completed' &&
                        job.status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusUpdate(job.id, 'cancelled')}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Cancel
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {(meta.current_page - 1) * meta.per_page + 1} to{' '}
                {Math.min(meta.current_page * meta.per_page, meta.total)} of{' '}
                {meta.total} jobs
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={meta.current_page === 1}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  disabled={meta.current_page === meta.last_page}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
