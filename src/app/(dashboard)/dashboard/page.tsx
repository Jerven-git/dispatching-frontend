'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { DashboardStats } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
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

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>;
  }

  if (!stats) return null;

  const statCards = [
    { label: "Today's Jobs", value: stats.todays_jobs, color: 'bg-blue-500' },
    { label: 'Pending', value: stats.pending_jobs, color: 'bg-yellow-500' },
    { label: 'In Progress', value: stats.in_progress_jobs, color: 'bg-orange-500' },
    { label: 'Completed', value: stats.completed_jobs, color: 'bg-green-500' },
    { label: 'Assigned', value: stats.assigned_jobs, color: 'bg-indigo-500' },
    { label: 'Total Jobs', value: stats.total_jobs, color: 'bg-gray-500' },
  ];

  if (stats.total_customers !== undefined) {
    statCards.push(
      { label: 'Customers', value: stats.total_customers, color: 'bg-purple-500' },
      { label: 'Technicians', value: stats.total_technicians ?? 0, color: 'bg-teal-500' }
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        Welcome back, {user?.name}
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="mt-1 text-3xl font-bold">{card.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-full ${card.color} opacity-20`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
