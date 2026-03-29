'use client';

import { Card, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui';
import type { JobsByDateItem } from '@/types';

interface DailyJobsTableProps {
  data: JobsByDateItem[];
  loading?: boolean;
}

export default function DailyJobsTable({ data, loading }: DailyJobsTableProps) {
  if (loading) {
    return (
      <Card>
        <div className="h-6 w-36 rounded bg-gray-200 animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 rounded bg-gray-200 animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Jobs by Date</h2>

      {data.length === 0 ? (
        <p className="text-sm text-gray-500">No data for this period.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Completed</TableHead>
              <TableHead className="text-right">Cancelled</TableHead>
              <TableHead className="text-right">Completion Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => {
              const rate = item.total > 0
                ? ((item.completed / item.total) * 100).toFixed(0)
                : '0';

              return (
                <TableRow key={item.date}>
                  <TableCell className="text-sm">
                    {new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {item.total}
                  </TableCell>
                  <TableCell className="text-right text-sm text-green-700">
                    {item.completed}
                  </TableCell>
                  <TableCell className="text-right text-sm text-red-600">
                    {item.cancelled}
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-600">
                    {rate}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
