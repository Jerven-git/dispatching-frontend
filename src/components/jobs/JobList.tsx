'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  statusLabels,
  priorityLabels,
  JOB_STATUSES,
  JOB_PRIORITIES,
} from '@/lib/job-constants';
import {
  Input,
  Select,
  Button,
  Card,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Pagination,
  Badge,
  getStatusBadgeVariant,
  getPriorityBadgeVariant,
  PageHeader,
} from '@/components/ui';
import type { ServiceJob, PaginatedResponse, JobStatus } from '@/types';

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

  // Debounced fetch: resets to page 1 on filter/search change, or fetches current page on page change
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchJobs({ status: statusFilter, priority: priorityFilter, search, page });
    }, 300);
    return () => clearTimeout(timeout);
  }, [statusFilter, priorityFilter, search, page, fetchJobs]);

  const handleStatusUpdate = async (jobId: number, status: string) => {
    if (onStatusUpdate) {
      await onStatusUpdate(jobId, status);
      fetchJobs({ status: statusFilter, priority: priorityFilter, search, page });
    }
  };

  const statusOptions = availableStatuses.map((s) => ({
    value: s,
    label: statusLabels[s],
  }));

  const priorityOptions = JOB_PRIORITIES.map((p) => ({
    value: p,
    label: priorityLabels[p],
  }));

  return (
    <div>
      {/* Header */}
      <PageHeader
        title={title}
        actions={
          <>
            <div className="w-52">
              <Input
                placeholder="Search ref# or customer..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              options={statusOptions}
              placeholder="All Statuses"
            />
            <Select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              options={priorityOptions}
              placeholder="All Priorities"
            />
            {showCreateButton && (
              <Link href={`${basePath}/create`}>
                <Button variant="primary">Create Job</Button>
              </Link>
            )}
          </>
        }
      />

      {/* Table */}
      {loading ? (
        <Card>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-gray-200 animate-pulse" />
            ))}
          </div>
        </Card>
      ) : jobs.length === 0 ? (
        <Card padding="lg" className="text-center text-gray-500">
          No jobs found.
        </Card>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                {showTechnician && <TableHead>Technician</TableHead>}
                <TableHead>Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="whitespace-nowrap font-medium">
                    <Link
                      href={`${basePath}/${job.id}`}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      {job.reference_number}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-gray-700">
                    {job.customer?.name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-gray-700">
                    {job.service?.name}
                  </TableCell>
                  {showTechnician && (
                    <TableCell className="whitespace-nowrap text-gray-700">
                      {job.technician?.name || (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="whitespace-nowrap text-gray-700">
                    {job.scheduled_date}
                    {job.scheduled_time && ` ${job.scheduled_time}`}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant={getPriorityBadgeVariant(job.priority)}>
                      {priorityLabels[job.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant={getStatusBadgeVariant(job.status)}>
                      {statusLabels[job.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right space-x-2">
                    <Link
                      href={`${basePath}/${job.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={meta.current_page}
                totalPages={meta.last_page}
                totalItems={meta.total}
                itemsPerPage={meta.per_page}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
