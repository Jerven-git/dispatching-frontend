'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import DateRangeFilter from './DateRangeFilter';
import StatusBreakdown from './StatusBreakdown';
import TechnicianPerformanceTable from './TechnicianPerformanceTable';
import DailyJobsTable from './DailyJobsTable';
import type {
  ReportSummary,
  JobsByStatusItem,
  JobsByDateItem,
  TechnicianPerformanceItem,
} from '@/types';

function getDefaultRange(): [string, string] {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  return [
    start.toISOString().split('T')[0],
    today.toISOString().split('T')[0],
  ];
}

export default function ReportsPage() {
  const [defaultFrom, defaultTo] = getDefaultRange();
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [statusData, setStatusData] = useState<JobsByStatusItem[]>([]);
  const [dateData, setDateData] = useState<JobsByDateItem[]>([]);
  const [techData, setTechData] = useState<TechnicianPerformanceItem[]>([]);

  const fetchAll = useCallback((f: string, t: string) => {
    setLoading(true);
    const params = { from: f, to: t };

    Promise.all([
      api.get<{ summary: ReportSummary }>('/reports/summary', params),
      api.get<{ statuses: JobsByStatusItem[] }>('/reports/jobs-by-status', params),
      api.get<{ dates: JobsByDateItem[] }>('/reports/jobs-by-date', params),
      api.get<{ technicians: TechnicianPerformanceItem[] }>('/reports/technician-performance', params),
    ])
      .then(([sumRes, statusRes, dateRes, techRes]) => {
        setSummary(sumRes.summary);
        setStatusData(statusRes.statuses);
        setDateData(dateRes.dates);
        setTechData(techRes.technicians);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAll(from, to);
  }, [from, to, fetchAll]);

  const handleDateChange = (newFrom: string, newTo: string) => {
    setFrom(newFrom);
    setTo(newTo);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Reports</h1>

      {/* Date Range Filter */}
      <div className="mb-6">
        <DateRangeFilter from={from} to={to} onChange={handleDateChange} />
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: 'Total Jobs', value: summary.total_jobs, color: 'bg-indigo-500' },
            { label: 'Completed', value: summary.completed_jobs, color: 'bg-green-500' },
            { label: 'In Progress', value: summary.in_progress_jobs, color: 'bg-orange-500' },
            { label: 'Pending', value: summary.pending_jobs, color: 'bg-yellow-500' },
            { label: 'Cancelled', value: summary.cancelled_jobs, color: 'bg-red-500' },
            {
              label: 'Revenue',
              value: `$${summary.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
              color: 'bg-emerald-500',
            },
          ].map((card) => (
            <div key={card.label} className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500">{card.label}</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{card.value}</p>
              <div className={`mt-2 h-1 w-full rounded-full ${card.color} opacity-30`} />
            </div>
          ))}
        </div>
      )}

      {loading && !summary && (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-gray-200 animate-pulse" />
          ))}
        </div>
      )}

      {/* Status Breakdown + Technician Performance */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StatusBreakdown data={statusData} loading={loading} />
        <TechnicianPerformanceTable data={techData} loading={loading} />
      </div>

      {/* Daily Jobs */}
      <DailyJobsTable data={dateData} loading={loading} />
    </div>
  );
}
