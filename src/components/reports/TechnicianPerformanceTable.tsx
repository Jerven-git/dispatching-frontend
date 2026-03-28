'use client';

import type { TechnicianPerformanceItem } from '@/types';

interface TechnicianPerformanceTableProps {
  data: TechnicianPerformanceItem[];
  loading?: boolean;
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return '-';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default function TechnicianPerformanceTable({
  data,
  loading,
}: TechnicianPerformanceTableProps) {
  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="h-6 w-52 rounded bg-gray-200 animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Technician Performance</h2>

      {data.length === 0 ? (
        <p className="text-sm text-gray-500">No completed jobs for this period.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Technician
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Completed
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Revenue
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Avg Duration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.technician.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">
                      {item.technician.name}
                    </p>
                    <p className="text-xs text-gray-500">{item.technician.email}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    {item.completed_jobs}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    ${item.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {formatDuration(item.avg_duration_minutes)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300">
                <td className="px-4 py-3 text-sm font-semibold text-gray-700">Total</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                  {data.reduce((s, i) => s + i.completed_jobs, 0)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                  ${data.reduce((s, i) => s + i.total_revenue, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
