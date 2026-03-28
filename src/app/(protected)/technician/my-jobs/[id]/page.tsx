'use client';

import { use, useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import JobStatusHistory from '@/components/jobs/JobStatusHistory';
import {
  statusColors,
  statusLabels,
  priorityColors,
  priorityLabels,
  JOB_STATUSES,
} from '@/lib/job-constants';
import type { ServiceJob, JobStatus } from '@/types';

const STATUS_ORDER: JobStatus[] = ['pending', 'assigned', 'on_the_way', 'in_progress', 'completed'];

function StatusProgressBar({ current }: { current: JobStatus }) {
  if (current === 'cancelled') {
    return (
      <div className="rounded-md bg-red-50 p-3 text-center text-sm font-medium text-red-700">
        This job has been cancelled
      </div>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(current);

  return (
    <div className="flex items-center gap-1">
      {STATUS_ORDER.map((status, idx) => (
        <div key={status} className="flex flex-1 flex-col items-center">
          <div
            className={`h-2 w-full rounded-full ${
              idx <= currentIdx ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
          <span
            className={`mt-1 text-[10px] leading-tight ${
              idx <= currentIdx ? 'font-medium text-blue-700' : 'text-gray-400'
            }`}
          >
            {statusLabels[status]}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TechnicianJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [job, setJob] = useState<ServiceJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ job: ServiceJob }>(`/service-jobs/${id}`)
      .then((data) => {
        setJob(data.job);
        setNotes(data.job.technician_notes ?? '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status: string) => {
    setConfirmAction(null);
    setUpdating(true);
    try {
      const data = await api.patch<{ job: ServiceJob }>(
        `/my-jobs/${id}/status`,
        { status }
      );
      setJob(data.job);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async (e: FormEvent) => {
    e.preventDefault();
    setSavingNotes(true);
    setNotesSaved(false);
    try {
      const data = await api.patch<{ job: ServiceJob }>(
        `/my-jobs/${id}/status`,
        { status: job!.status, technician_notes: notes }
      );
      setJob(data.job);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-32 rounded bg-gray-200" />
        <div className="h-48 rounded-lg bg-gray-200" />
        <div className="h-32 rounded-lg bg-gray-200" />
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
    <div className="pb-28">
      {/* Back link */}
      <Link
        href="/technician/my-jobs"
        className="mb-4 inline-flex items-center text-sm text-blue-600 active:text-blue-800"
      >
        &larr; Back to My Jobs
      </Link>

      {/* Header: ref# + badges */}
      <div className="mb-4 flex items-start justify-between">
        <h1 className="text-xl font-bold">{job.reference_number}</h1>
        <div className="flex gap-1.5">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
              priorityColors[job.priority]
            }`}
          >
            {priorityLabels[job.priority]}
          </span>
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
              statusColors[job.status]
            }`}
          >
            {statusLabels[job.status]}
          </span>
        </div>
      </div>

      {/* Status progress */}
      <div className="mb-6">
        <StatusProgressBar current={job.status} />
      </div>

      {/* Customer card */}
      <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-xs font-medium uppercase text-gray-500">Customer</h2>
        <p className="text-sm font-semibold text-gray-900">{job.customer?.name}</p>
        {job.customer?.phone && (
          <a
            href={`tel:${job.customer.phone}`}
            className="mt-1 inline-block text-sm text-blue-600 active:text-blue-800"
          >
            {job.customer.phone}
          </a>
        )}
        <div className="mt-2 border-t border-gray-100 pt-2">
          <p className="text-xs font-medium uppercase text-gray-500">Service Address</p>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(job.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 block text-sm text-blue-600 active:text-blue-800"
          >
            {job.address}
          </a>
        </div>
      </div>

      {/* Job info card */}
      <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-xs font-medium uppercase text-gray-500">Job Info</h2>
        <dl className="grid grid-cols-2 gap-3">
          <div>
            <dt className="text-xs text-gray-500">Service</dt>
            <dd className="text-sm font-medium text-gray-900">{job.service?.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Scheduled</dt>
            <dd className="text-sm font-medium text-gray-900">
              {job.scheduled_date}
              {job.scheduled_time && (
                <span className="block text-xs text-gray-500">{job.scheduled_time}</span>
              )}
            </dd>
          </div>
          {job.total_cost && (
            <div>
              <dt className="text-xs text-gray-500">Cost</dt>
              <dd className="text-sm font-medium text-gray-900">
                ${parseFloat(job.total_cost).toFixed(2)}
              </dd>
            </div>
          )}
          {job.description && (
            <div className="col-span-2">
              <dt className="text-xs text-gray-500">Notes from dispatcher</dt>
              <dd className="mt-0.5 whitespace-pre-line text-sm text-gray-700">
                {job.description}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Timeline card */}
      <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-xs font-medium uppercase text-gray-500">Timeline</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Created</dt>
            <dd className="text-gray-900">{new Date(job.created_at).toLocaleString()}</dd>
          </div>
          {job.started_at && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Started</dt>
              <dd className="text-gray-900">{new Date(job.started_at).toLocaleString()}</dd>
            </div>
          )}
          {job.completed_at && (
            <div className="flex justify-between">
              <dt className="text-green-600">Completed</dt>
              <dd className="text-green-700">{new Date(job.completed_at).toLocaleString()}</dd>
            </div>
          )}
          {job.cancelled_at && (
            <div className="flex justify-between">
              <dt className="text-red-600">Cancelled</dt>
              <dd className="text-red-700">{new Date(job.cancelled_at).toLocaleString()}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Status History */}
      {job.status_logs && job.status_logs.length > 0 && (
        <div className="mb-4">
          <JobStatusHistory logs={job.status_logs} />
        </div>
      )}

      {/* Technician notes form */}
      <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-xs font-medium uppercase text-gray-500">
          My Notes
        </h2>
        <form onSubmit={handleSaveNotes}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            disabled={isTerminal}
            placeholder="Add work notes, findings, or issues..."
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
          {!isTerminal && (
            <div className="mt-2 flex items-center justify-between">
              <button
                type="submit"
                disabled={savingNotes}
                className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white active:bg-gray-900 disabled:opacity-50"
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
              {notesSaved && (
                <span className="text-sm text-green-600">Saved!</span>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Confirmation dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Confirm Action</h3>
            <p className="mt-2 text-sm text-gray-600">
              {confirmAction === 'completed'
                ? 'Are you sure you want to mark this job as completed?'
                : 'Are you sure you want to cancel this job?'}
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 active:bg-gray-100"
              >
                Go Back
              </button>
              <button
                onClick={() => handleStatusChange(confirmAction)}
                disabled={updating}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                  confirmAction === 'completed'
                    ? 'bg-green-600 active:bg-green-700'
                    : 'bg-red-600 active:bg-red-700'
                }`}
              >
                {updating ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky action buttons at bottom */}
      {!isTerminal && (
        <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white p-4 md:left-64">
          <div className="mx-auto flex max-w-lg gap-3">
            {job.status === 'assigned' && (
              <button
                onClick={() => handleStatusChange('on_the_way')}
                disabled={updating}
                className="flex-1 rounded-lg bg-purple-600 py-3 text-sm font-semibold text-white active:bg-purple-700 disabled:opacity-50"
              >
                On the Way
              </button>
            )}
            {(job.status === 'assigned' || job.status === 'on_the_way') && (
              <button
                onClick={() => handleStatusChange('in_progress')}
                disabled={updating}
                className="flex-1 rounded-lg bg-orange-600 py-3 text-sm font-semibold text-white active:bg-orange-700 disabled:opacity-50"
              >
                Start Job
              </button>
            )}
            {job.status === 'in_progress' && (
              <button
                onClick={() => setConfirmAction('completed')}
                disabled={updating}
                className="flex-1 rounded-lg bg-green-600 py-3 text-sm font-semibold text-white active:bg-green-700 disabled:opacity-50"
              >
                Mark Completed
              </button>
            )}
            <button
              onClick={() => setConfirmAction('cancelled')}
              disabled={updating}
              className="rounded-lg border border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-600 active:bg-red-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
