'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  statusColors,
  statusLabels,
  priorityColors,
  priorityLabels,
} from '@/lib/job-constants';
import TechnicianAssignPanel from './TechnicianAssignPanel';
import JobStatusHistory from './JobStatusHistory';
import type { ServiceJob } from '@/types';

interface JobDetailProps {
  jobId: string;
  basePath: string;
  apiEndpoint?: string;
  statusEndpoint?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canChangeStatus?: boolean;
  canAssign?: boolean;
}

export default function JobDetail({
  jobId,
  basePath,
  apiEndpoint = '/service-jobs',
  statusEndpoint,
  canEdit = true,
  canDelete = false,
  canChangeStatus = true,
  canAssign = false,
}: JobDetailProps) {
  const [job, setJob] = useState<ServiceJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    api
      .get<{ job: ServiceJob }>(`${apiEndpoint}/${jobId}`)
      .then((data) => setJob(data.job))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [jobId, apiEndpoint]);

  const handleStatusChange = async (status: string) => {
    if (!job) return;
    const endpoint = statusEndpoint
      ? `${statusEndpoint}/${jobId}/status`
      : `${apiEndpoint}/${jobId}/status`;

    setUpdating(true);
    try {
      const data = await api.patch<{ job: ServiceJob }>(endpoint, { status });
      setJob(data.job);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await api.delete(`${apiEndpoint}/${jobId}`);
      router.push(basePath);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 rounded bg-gray-200" />
        <div className="h-72 rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rounded-lg bg-white p-12 text-center text-gray-500 shadow-sm">
        Job not found.
      </div>
    );
  }

  const isTerminal = job.status === 'completed' || job.status === 'cancelled';

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href={basePath} className="text-sm text-blue-600 hover:text-blue-800">
            &larr; Back to Jobs
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-2xl font-bold">{job.reference_number}</h1>
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                statusColors[job.status]
              }`}
            >
              {statusLabels[job.status]}
            </span>
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                priorityColors[job.priority]
              }`}
            >
              {priorityLabels[job.priority]}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          {canEdit && !isTerminal && (
            <Link
              href={`${basePath}/${job.id}/edit`}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Edit
            </Link>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Job Details</h2>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Customer</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.customer?.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Service</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.service?.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Technician</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {job.technician ? (
                  <span className="font-medium">{job.technician.name}</span>
                ) : (
                  <span className="text-amber-600">Unassigned</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created By</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.creator?.name}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Service Address</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.address}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Scheduled</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {job.scheduled_date}
                {job.scheduled_time && ` at ${job.scheduled_time}`}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Cost</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {job.total_cost ? `$${parseFloat(job.total_cost).toFixed(2)}` : '-'}
              </dd>
            </div>
            {job.description && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 whitespace-pre-line text-sm text-gray-900">
                  {job.description}
                </dd>
              </div>
            )}
            {job.technician_notes && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Technician Notes</dt>
                <dd className="mt-1 whitespace-pre-line text-sm text-gray-900">
                  {job.technician_notes}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Status History */}
        {job.status_logs && job.status_logs.length > 0 && (
          <div className="lg:col-span-2">
            <JobStatusHistory logs={job.status_logs} />
          </div>
        )}

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Timeline</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(job.created_at).toLocaleString()}
                </dd>
              </div>
              {job.started_at && (
                <div>
                  <dt className="text-xs font-medium text-gray-500">Started</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(job.started_at).toLocaleString()}
                  </dd>
                </div>
              )}
              {job.completed_at && (
                <div>
                  <dt className="text-xs font-medium text-gray-500">Completed</dt>
                  <dd className="text-sm text-green-700">
                    {new Date(job.completed_at).toLocaleString()}
                  </dd>
                </div>
              )}
              {job.cancelled_at && (
                <div>
                  <dt className="text-xs font-medium text-gray-500">Cancelled</dt>
                  <dd className="text-sm text-red-700">
                    {new Date(job.cancelled_at).toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Assignment Panel */}
          {canAssign && (
            <TechnicianAssignPanel job={job} onAssigned={setJob} />
          )}

          {/* Status Actions */}
          {canChangeStatus && !isTerminal && (
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Update Status</h2>
              <div className="flex flex-col gap-2">
                {job.status === 'assigned' && (
                  <button
                    onClick={() => handleStatusChange('on_the_way')}
                    disabled={updating}
                    className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                  >
                    On the Way
                  </button>
                )}
                {(job.status === 'assigned' || job.status === 'on_the_way') && (
                  <button
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={updating}
                    className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                  >
                    Start Job
                  </button>
                )}
                {job.status === 'in_progress' && (
                  <button
                    onClick={() => handleStatusChange('completed')}
                    disabled={updating}
                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Mark Completed
                  </button>
                )}
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={updating}
                  className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Cancel Job
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
