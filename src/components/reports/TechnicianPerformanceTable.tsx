'use client';

import { Card, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui';
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
      <Card>
        <div className="h-6 w-52 rounded bg-gray-200 animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-gray-200 animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Technician Performance</h2>

      {data.length === 0 ? (
        <p className="text-sm text-gray-500">No completed jobs for this period.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Technician</TableHead>
              <TableHead className="text-right">Completed</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Avg Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.technician.id}>
                <TableCell>
                  <p className="text-sm font-medium text-gray-900">
                    {item.technician.name}
                  </p>
                  <p className="text-xs text-gray-500">{item.technician.email}</p>
                </TableCell>
                <TableCell className="text-right text-sm font-semibold">
                  {item.completed_jobs}
                </TableCell>
                <TableCell className="text-right text-sm">
                  ${item.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right text-sm text-gray-600">
                  {formatDuration(item.avg_duration_minutes)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <tfoot>
            <tr className="border-t-2 border-gray-300">
              <TableCell className="text-sm font-semibold text-gray-700">Total</TableCell>
              <TableCell className="text-right text-sm font-bold">
                {data.reduce((s, i) => s + i.completed_jobs, 0)}
              </TableCell>
              <TableCell className="text-right text-sm font-bold">
                ${data.reduce((s, i) => s + i.total_revenue, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell />
            </tr>
          </tfoot>
        </Table>
      )}
    </Card>
  );
}
