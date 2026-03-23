'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ServiceJob, PaginatedResponse } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<ServiceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const { user } = useAuth();

  const fetchJobs = (status?: string) => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (status) params.status = status;

    api
      .get<PaginatedResponse<ServiceJob>>('/service-jobs', params)
      .then((data) => setJobs(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs(statusFilter);
  }, [statusFilter]);

  const handleStatusUpdate = async (jobId: number, status: string) => {
    try {
      await api.patch(`/service-jobs/${jobId}/status`, { status });
      fetchJobs(statusFilter);
    } catch (err) {
      console.error(err);
    }
  };

  const canManageJobs = user?.role === 'admin' || user?.role === 'dispatcher';

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center text-gray-500 shadow-sm">
          No jobs found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Ref #</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Technician</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {job.reference_number}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {job.customer?.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {job.service?.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {job.technician?.name || <span className="text-gray-400">Unassigned</span>}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {job.scheduled_date}
                    {job.scheduled_time && ` ${job.scheduled_time}`}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${priorityColors[job.priority]}`}>
                      {job.priority}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[job.status]}`}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {user?.role === 'technician' && job.status === 'assigned' && (
                      <button
                        onClick={() => handleStatusUpdate(job.id, 'in_progress')}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Start
                      </button>
                    )}
                    {user?.role === 'technician' && job.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusUpdate(job.id, 'completed')}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Complete
                      </button>
                    )}
                    {canManageJobs && job.status !== 'completed' && job.status !== 'cancelled' && (
                      <button
                        onClick={() => handleStatusUpdate(job.id, 'cancelled')}
                        className="text-red-600 hover:text-red-800 font-medium ml-3"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
