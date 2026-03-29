'use client';

import Link from 'next/link';
import { statusLabels, priorityLabels } from '@/lib/job-constants';
import { Card, Badge, Button } from '@/components/ui';
import { getStatusBadgeVariant, getPriorityBadgeVariant } from '@/components/ui';
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
    <Link href={`/technician/my-jobs/${job.id}`} className="block">
      <Card variant="interactive" padding="sm">
        {/* Top row: ref# + badges */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-gray-900">
            {job.reference_number}
          </span>
          <div className="flex shrink-0 gap-1.5">
            <Badge variant={getPriorityBadgeVariant(job.priority)}>
              {priorityLabels[job.priority]}
            </Badge>
            <Badge variant={getStatusBadgeVariant(job.status)}>
              {statusLabels[job.status]}
            </Badge>
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
              <Button
                size="sm"
                className="flex-1 bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-700"
                onClick={(e) => handleAction(e, 'on_the_way')}
              >
                On the Way
              </Button>
            )}
            {(job.status === 'assigned' || job.status === 'on_the_way') && (
              <Button
                size="sm"
                className="flex-1 bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-700"
                onClick={(e) => handleAction(e, 'in_progress')}
              >
                Start Job
              </Button>
            )}
            {job.status === 'in_progress' && (
              <Button
                size="sm"
                className="flex-1 bg-green-600 text-white hover:bg-green-700 active:bg-green-700"
                onClick={(e) => handleAction(e, 'completed')}
              >
                Complete
              </Button>
            )}
          </div>
        )}
      </Card>
    </Link>
  );
}
