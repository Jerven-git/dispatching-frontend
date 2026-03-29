'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { statusLabels } from '@/lib/job-constants';
import TechnicianJobCard from '@/components/jobs/TechnicianJobCard';
import { Button, Card } from '@/components/ui';
import type { ServiceJob, PaginatedResponse, JobStatus } from '@/types';

const tabs: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: statusLabels.assigned, value: 'assigned' },
  { label: statusLabels.on_the_way, value: 'on_the_way' },
  { label: statusLabels.in_progress, value: 'in_progress' },
  { label: statusLabels.completed, value: 'completed' },
];

export default function TechnicianMyJobsPage() {
  const [jobs, setJobs] = useState<ServiceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = useCallback((status: string) => {
    const params: Record<string, string> = {};
    if (status) params.status = status;

    api
      .get<PaginatedResponse<ServiceJob>>('/my-jobs', params)
      .then((data) => setJobs(data.data))
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchJobs(statusFilter);
  }, [statusFilter, fetchJobs]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchJobs(statusFilter);
  };

  const handleStatusUpdate = async (jobId: number, status: string) => {
    try {
      await api.patch(`/my-jobs/${jobId}/status`, { status });
      fetchJobs(statusFilter);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold md:text-2xl">My Jobs</h1>
        <Button variant="outline" size="sm" onClick={handleRefresh} loading={refreshing}>
          Refresh
        </Button>
      </div>

      {/* Status filter tabs (horizontal scroll on mobile) */}
      <div className="mb-4 -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 active:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Job cards */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card padding="lg">
          <p className="text-center text-gray-500">
            {statusFilter
              ? `No ${statusLabels[statusFilter as JobStatus].toLowerCase()} jobs.`
              : 'No jobs assigned to you.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <TechnicianJobCard
              key={job.id}
              job={job}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
