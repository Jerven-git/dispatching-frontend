'use client';

import { statusColors, statusLabels } from '@/lib/job-constants';
import type { JobsByStatusItem, JobStatus } from '@/types';

interface StatusBreakdownProps {
  data: JobsByStatusItem[];
  loading?: boolean;
}

export default function StatusBreakdown({ data, loading }: StatusBreakdownProps) {
  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="h-6 w-40 rounded bg-gray-200 animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Jobs by Status</h2>

      {data.length === 0 ? (
        <p className="text-sm text-gray-500">No data for this period.</p>
      ) : (
        <div className="space-y-3">
          {data.map((item) => {
            const pct = total > 0 ? (item.count / total) * 100 : 0;

            return (
              <div key={item.status} className="flex items-center gap-4">
                <span
                  className={`inline-flex w-28 justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                    statusColors[item.status as JobStatus] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusLabels[item.status as JobStatus] || item.status}
                </span>

                <div className="flex-1">
                  <div className="h-5 rounded-full bg-gray-100">
                    <div
                      className="h-5 rounded-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${Math.max(pct, 1)}%` }}
                    />
                  </div>
                </div>

                <div className="w-20 text-right">
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                  <span className="ml-1 text-xs text-gray-400">({pct.toFixed(0)}%)</span>
                </div>

                <div className="w-24 text-right text-sm text-gray-600">
                  ${item.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            );
          })}

          {/* Total row */}
          <div className="flex items-center gap-4 border-t border-gray-200 pt-3">
            <span className="w-28 text-center text-xs font-semibold text-gray-700">Total</span>
            <div className="flex-1" />
            <div className="w-20 text-right">
              <span className="text-sm font-bold text-gray-900">{total}</span>
            </div>
            <div className="w-24 text-right text-sm font-semibold text-gray-900">
              ${data.reduce((s, i) => s + i.revenue, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
