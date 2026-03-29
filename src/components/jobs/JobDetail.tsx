'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  statusLabels,
  priorityLabels,
} from '@/lib/job-constants';
import {
  Button,
  Card,
  Badge,
  PageHeader,
  getStatusBadgeVariant,
  getPriorityBadgeVariant,
} from '@/components/ui';
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
      <Card padding="lg">
        <p className="text-center text-gray-500">Job not found.</p>
      </Card>
    );
  }

  const isTerminal = job.status === 'completed' || job.status === 'cancelled';

  return (
    <div>
      {/* Header */}
      <PageHeader
        title={job.reference_number}
        backLink={{ href: basePath, label: 'Back to Jobs' }}
        actions={
          <>
            <Badge variant={getStatusBadgeVariant(job.status)}>
              {statusLabels[job.status]}
            </Badge>
            <Badge variant={getPriorityBadgeVariant(job.priority)}>
              {priorityLabels[job.priority]}
            </Badge>
            {canEdit && !isTerminal && (
              <Link href={`${basePath}/${job.id}/edit`}>
                <Button variant="primary" size="sm">Edit</Button>
              </Link>
            )}
            {canDelete && (
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                Delete
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <Card className="lg:col-span-2">
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
        </Card>

        {/* Status History */}
        {job.status_logs && job.status_logs.length > 0 && (
          <div className="lg:col-span-2">
            <JobStatusHistory logs={job.status_logs} />
          </div>
        )}

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
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
          </Card>

          {/* Assignment Panel */}
          {canAssign && (
            <TechnicianAssignPanel job={job} onAssigned={setJob} />
          )}

          {/* Status Actions */}
          {canChangeStatus && !isTerminal && (
            <Card>
              <h2 className="mb-4 text-lg font-semibold">Update Status</h2>
              <div className="flex flex-col gap-2">
                {job.status === 'assigned' && (
                  <Button
                    onClick={() => handleStatusChange('on_the_way')}
                    disabled={updating}
                    fullWidth
                    className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800"
                  >
                    On the Way
                  </Button>
                )}
                {(job.status === 'assigned' || job.status === 'on_the_way') && (
                  <Button
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={updating}
                    fullWidth
                    className="bg-orange-600 hover:bg-orange-700 active:bg-orange-800"
                  >
                    Start Job
                  </Button>
                )}
                {job.status === 'in_progress' && (
                  <Button
                    onClick={() => handleStatusChange('completed')}
                    disabled={updating}
                    fullWidth
                    className="bg-green-600 hover:bg-green-700 active:bg-green-800"
                  >
                    Mark Completed
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={updating}
                  fullWidth
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Cancel Job
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
