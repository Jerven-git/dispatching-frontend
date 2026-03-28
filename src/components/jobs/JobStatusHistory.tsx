'use client';

import { statusLabels, statusColors } from '@/lib/job-constants';
import type { JobStatusLog, JobStatus } from '@/types';

interface JobStatusHistoryProps {
  logs: JobStatusLog[];
}

export default function JobStatusHistory({ logs }: JobStatusHistoryProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Status History</h2>
        <p className="text-sm text-gray-500">No status changes recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Status History</h2>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200" />

        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="relative flex gap-4 pl-8">
              {/* Dot */}
              <div
                className={`absolute left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white ${
                  statusColors[log.new_status]?.replace('text-', 'bg-').split(' ')[0] ||
                  'bg-gray-400'
                }`}
              />

              <div className="min-w-0 flex-1">
                {/* Status change */}
                <div className="flex flex-wrap items-center gap-1.5 text-sm">
                  {log.old_status ? (
                    <>
                      <span className="text-gray-500">
                        {statusLabels[log.old_status as JobStatus] || log.old_status}
                      </span>
                      <span className="text-gray-400">&rarr;</span>
                    </>
                  ) : null}
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      statusColors[log.new_status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {statusLabels[log.new_status as JobStatus] || log.new_status}
                  </span>
                </div>

                {/* Who + when */}
                <p className="mt-0.5 text-xs text-gray-500">
                  by {log.changed_by?.name || 'System'}
                  {' · '}
                  {new Date(log.created_at).toLocaleString()}
                </p>

                {/* Remarks */}
                {log.remarks && (
                  <p className="mt-1 text-sm text-gray-600 italic">
                    &ldquo;{log.remarks}&rdquo;
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
