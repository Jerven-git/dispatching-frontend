'use client';

import type { JobsByDateItem } from '@/types';

interface DailyJobsTableProps {
  data: JobsByDateItem[];
  loading?: boolean;
}

export default function DailyJobsTable({ data, loading }: DailyJobsTableProps) {
  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="h-6 w-36 rounded bg-gray-200 animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 rounded bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Jobs by Date</h2>

      {data.length === 0 ? (
        <p className="text-sm text-gray-500">No data for this period.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Total
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Completed
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Cancelled
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Completion Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item) => {
                const rate = item.total > 0
                  ? ((item.completed / item.total) * 100).toFixed(0)
                  : '0';

                return (
                  <tr key={item.date} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                      {item.total}
                    </td>
                    <td className="px-4 py-2 text-right text-sm text-green-700">
                      {item.completed}
                    </td>
                    <td className="px-4 py-2 text-right text-sm text-red-600">
                      {item.cancelled}
                    </td>
                    <td className="px-4 py-2 text-right text-sm text-gray-600">
                      {rate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
