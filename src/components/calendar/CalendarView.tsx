'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { statusLabels } from '@/lib/job-constants';
import { Badge, getStatusBadgeVariant, getPriorityBadgeVariant } from '@/components/ui';
import type { JobStatus, JobPriority } from '@/types';

interface CalendarJob {
  id: number;
  reference_number: string;
  customer: { id: number; name: string } | null;
  service: { id: number; name: string } | null;
  technician: { id: number; name: string } | null;
  status: JobStatus;
  priority: JobPriority;
  address: string;
  scheduled_date: string;
  scheduled_time: string | null;
}

interface CalendarViewProps {
  basePath: string;
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView({ basePath }: CalendarViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [jobs, setJobs] = useState<CalendarJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(() => {
    setLoading(true);
    const from = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    api
      .get<{ jobs: CalendarJob[] }>('/service-jobs/calendar', { from, to }, { skipCache: true })
      .then((data) => setJobs(data.jobs))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year, month]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  // Group jobs by date
  const jobsByDate: Record<string, CalendarJob[]> = {};
  for (const job of jobs) {
    const key = job.scheduled_date;
    if (!jobsByDate[key]) jobsByDate[key] = [];
    jobsByDate[key].push(job);
  }

  const days = getDaysInMonth(year, month);
  const startPadding = days[0].getDay(); // 0=Sun
  const todayKey = formatDateKey(today);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={goToday} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
            Today
          </button>
          <button onClick={nextMonth} className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50">
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="ml-2 text-lg font-semibold text-gray-900">
            {MONTH_NAMES[month]} {year}
          </span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {DAY_NAMES.map((day) => (
            <div key={day} className="px-2 py-3 text-center text-xs font-semibold uppercase text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {/* Padding for start of month */}
          {Array.from({ length: startPadding }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-28 border-b border-r border-gray-100 bg-gray-50/50 p-1" />
          ))}

          {days.map((day) => {
            const key = formatDateKey(day);
            const dayJobs = jobsByDate[key] || [];
            const isToday = key === todayKey;

            return (
              <div
                key={key}
                className={`min-h-28 border-b border-r border-gray-100 p-1 ${isToday ? 'bg-indigo-50/40' : ''}`}
              >
                <div className="mb-1 flex items-center justify-between px-1">
                  <span className={`text-xs font-medium ${isToday ? 'flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white' : 'text-gray-700'}`}>
                    {day.getDate()}
                  </span>
                  {dayJobs.length > 0 && (
                    <span className="text-[10px] font-medium text-gray-400">{dayJobs.length}</span>
                  )}
                </div>

                <div className="space-y-0.5">
                  {loading ? (
                    <div className="h-5 rounded bg-gray-100 animate-pulse" />
                  ) : (
                    dayJobs.slice(0, 3).map((job) => (
                      <Link
                        key={job.id}
                        href={`${basePath}/jobs/${job.id}`}
                        className="block rounded px-1 py-0.5 text-[11px] leading-tight hover:opacity-80 transition-opacity truncate"
                        title={`${job.reference_number} - ${job.customer?.name || 'N/A'} (${statusLabels[job.status]})`}
                      >
                        <span className="flex items-center gap-1">
                          <Badge variant={getStatusBadgeVariant(job.status)} className="!px-1 !py-0 !text-[9px]">
                            {job.scheduled_time || statusLabels[job.status]}
                          </Badge>
                          <span className="truncate text-gray-700">{job.customer?.name || 'N/A'}</span>
                        </span>
                      </Link>
                    ))
                  )}
                  {dayJobs.length > 3 && (
                    <p className="px-1 text-[10px] text-gray-400">+{dayJobs.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
