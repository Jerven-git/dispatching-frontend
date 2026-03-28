import type { JobStatus, JobPriority } from '@/types';

export const statusColors: Record<JobStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  on_the_way: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const statusLabels: Record<JobStatus, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  on_the_way: 'On the Way',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const priorityColors: Record<JobPriority, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export const priorityLabels: Record<JobPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const JOB_STATUSES: JobStatus[] = [
  'pending', 'assigned', 'on_the_way', 'in_progress', 'completed', 'cancelled',
];

export const JOB_PRIORITIES: JobPriority[] = ['low', 'medium', 'high', 'urgent'];

/**
 * Valid status transitions. Each key maps to the statuses it can transition to.
 * Used by status action buttons across JobDetail, TechnicianJobCard, etc.
 */
export const STATUS_TRANSITIONS: Record<JobStatus, { status: JobStatus; label: string; color: string }[]> = {
  pending: [],
  assigned: [
    { status: 'on_the_way', label: 'On the Way', color: 'bg-purple-600 active:bg-purple-700 hover:bg-purple-700' },
    { status: 'in_progress', label: 'Start Job', color: 'bg-orange-600 active:bg-orange-700 hover:bg-orange-700' },
  ],
  on_the_way: [
    { status: 'in_progress', label: 'Start Job', color: 'bg-orange-600 active:bg-orange-700 hover:bg-orange-700' },
  ],
  in_progress: [
    { status: 'completed', label: 'Mark Completed', color: 'bg-green-600 active:bg-green-700 hover:bg-green-700' },
  ],
  completed: [],
  cancelled: [],
};
