'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import StatsGrid from '@/components/dashboard/StatsGrid';
import type { DashboardStats } from '@/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api
      .get<{ stats: DashboardStats }>('/dashboard')
      .then((data) => setStats(data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: "Today's Jobs", value: stats.todays_jobs, color: 'bg-blue-500' },
        { label: 'Pending', value: stats.pending_jobs, color: 'bg-yellow-500' },
        { label: 'In Progress', value: stats.in_progress_jobs, color: 'bg-orange-500' },
        { label: 'Completed', value: stats.completed_jobs, color: 'bg-green-500' },
        { label: 'Assigned', value: stats.assigned_jobs, color: 'bg-indigo-500' },
        { label: 'Total Jobs', value: stats.total_jobs, color: 'bg-gray-500' },
        { label: 'Customers', value: stats.total_customers ?? 0, color: 'bg-purple-500' },
        { label: 'Technicians', value: stats.total_technicians ?? 0, color: 'bg-teal-500' },
      ]
    : [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
      <p className="mb-6 text-gray-600">
        Welcome back, {user?.name}. Here&apos;s your system overview.
      </p>
      <StatsGrid stats={statCards} loading={loading} />
    </div>
  );
}
