'use client';

import Link from 'next/link';
import {
  statusColors,
  statusLabels,
  priorityColors,
  priorityLabels,
} from '@/lib/job-constants';
import type { ServiceJob } from '@/types';

interface TechnicianJobCardProps {
  job: ServiceJob;
  onStatusUpdate?: (jobId: number, status: string) => Promise<void>;
}

export default function TechnicianJobCard({
  job,
  onStatusUpdate,
}: TechnicianJobCardProps) {
  const isTerminal = job.status === 'completed' || job.status === 'cancelled';

  const handleAction = async (e: React.MouseEvent, status: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (onStatusUpdate) {
      await onStatusUpdate(job.id, status);
    }
  };

  return (
    <Link
      href={`/technician/my-jobs/${job.id}`}
      className="block rounded-lg bg-white p-4 shadow-sm transition active:bg-gray-50"
    >
      {/* Top row: ref# + badges */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-gray-900">
          {job.reference_number}
        </span>
        <div className="flex shrink-0 gap-1.5">
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

      {/* Customer + Service */}
      <div className="mt-2 space-y-1">
        <p className="text-sm font-medium text-gray-800">{job.customer?.name}</p>
        <p className="text-xs text-gray-500">{job.service?.name}</p>
      </div>

      {/* Address */}
      <p className="mt-2 truncate text-xs text-gray-500">{job.address}</p>

      {/* Date/time */}
      <p className="mt-1 text-xs text-gray-400">
        {job.scheduled_date}
        {job.scheduled_time && ` at ${job.scheduled_time}`}
      </p>

      {/* Quick action buttons */}
      {onStatusUpdate && !isTerminal && (
        <div className="mt-3 flex gap-2">
          {job.status === 'assigned' && (
            <button
              onClick={(e) => handleAction(e, 'on_the_way')}
              className="flex-1 rounded-md bg-purple-600 px-3 py-2 text-xs font-medium text-white active:bg-purple-700"
            >
              On the Way
            </button>
          )}
          {(job.status === 'assigned' || job.status === 'on_the_way') && (
            <button
              onClick={(e) => handleAction(e, 'in_progress')}
              className="flex-1 rounded-md bg-orange-600 px-3 py-2 text-xs font-medium text-white active:bg-orange-700"
            >
              Start Job
            </button>
          )}
          {job.status === 'in_progress' && (
            <button
              onClick={(e) => handleAction(e, 'completed')}
              className="flex-1 rounded-md bg-green-600 px-3 py-2 text-xs font-medium text-white active:bg-green-700"
            >
              Complete
            </button>
          )}
        </div>
      )}
    </Link>
  );
}
