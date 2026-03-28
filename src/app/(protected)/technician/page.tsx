'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import StatsGrid from '@/components/dashboard/StatsGrid';
import { statusColors, statusLabels, priorityColors, priorityLabels } from '@/lib/job-constants';
import type { DashboardStats, ServiceJob, PaginatedResponse } from '@/types';

export default function TechnicianDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayJobs, setTodayJobs] = useState<ServiceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    Promise.all([
      api.get<{ stats: DashboardStats }>('/dashboard'),
      api.get<PaginatedResponse<ServiceJob>>('/my-jobs', {
        per_page: '10',
      }),
    ])
      .then(([dashData, jobsData]) => {
        setStats(dashData.stats);
        // Filter to today's jobs and non-terminal statuses first
        const sorted = jobsData.data.sort((a, b) => {
          // Today's jobs first, then by status priority
          const aIsToday = a.scheduled_date === today ? 0 : 1;
          const bIsToday = b.scheduled_date === today ? 0 : 1;
          if (aIsToday !== bIsToday) return aIsToday - bIsToday;
          // Active statuses first
          const statusOrder = ['in_progress', 'on_the_way', 'assigned', 'pending', 'completed', 'cancelled'];
          return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        });
        setTodayJobs(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: "Today's Jobs", value: stats.todays_jobs, color: 'bg-blue-500' },
        { label: 'Assigned', value: stats.assigned_jobs, color: 'bg-indigo-500' },
        { label: 'In Progress', value: stats.in_progress_jobs, color: 'bg-orange-500' },
        { label: 'Completed', value: stats.completed_jobs, color: 'bg-green-500' },
      ]
    : [];

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold md:text-2xl">My Dashboard</h1>
      <p className="mb-6 text-sm text-gray-600">
        Welcome back, {user?.name}.
      </p>

      <StatsGrid stats={statCards} loading={loading} />

      {/* Upcoming jobs */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upcoming Jobs</h2>
          <Link
            href="/technician/my-jobs"
            className="text-sm text-blue-600 active:text-blue-800"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : todayJobs.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow-sm">
            No upcoming jobs.
          </div>
        ) : (
          <div className="space-y-3">
            {todayJobs.map((job) => (
              <Link
                key={job.id}
                href={`/technician/my-jobs/${job.id}`}
                className="block rounded-lg bg-white p-4 shadow-sm transition active:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {job.reference_number}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          statusColors[job.status]
                        }`}
                      >
                        {statusLabels[job.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700">{job.customer?.name}</p>
                    <p className="text-xs text-gray-500">{job.service?.name}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium text-gray-900">{job.scheduled_date}</p>
                    {job.scheduled_time && (
                      <p className="text-xs text-gray-500">{job.scheduled_time}</p>
                    )}
                    <span
                      className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        priorityColors[job.priority]
                      }`}
                    >
                      {priorityLabels[job.priority]}
                    </span>
                  </div>
                </div>
                <p className="mt-2 truncate text-xs text-gray-400">{job.address}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
