'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, Badge, Alert } from '@/components/ui';
import type { JobChecklistEntry } from '@/types';

interface Props {
  jobId: number;
  canEdit: boolean;
}

export default function JobChecklist({ jobId, canEdit }: Props) {
  const [entries, setEntries] = useState<JobChecklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<{ checklist: JobChecklistEntry[] }>(`/service-jobs/${jobId}/checklist`, undefined, { skipCache: true })
      .then((data) => setEntries(data.checklist))
      .catch(() => setError('Failed to load checklist'))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleToggle = async (itemId: number) => {
    if (!canEdit) return;

    // Optimistic update
    setEntries((prev) =>
      prev.map((e) =>
        e.checklist_item_id === itemId || e.checklist_item?.id === itemId
          ? { ...e, is_completed: !e.is_completed, completed_at: e.is_completed ? null : new Date().toISOString() }
          : e
      )
    );

    try {
      await api.patch(`/service-jobs/${jobId}/checklist/${itemId}/toggle`);
    } catch {
      // Revert on failure
      setEntries((prev) =>
        prev.map((e) =>
          e.checklist_item_id === itemId || e.checklist_item?.id === itemId
            ? { ...e, is_completed: !e.is_completed }
            : e
        )
      );
      setError('Failed to toggle checklist item');
    }
  };

  if (loading) {
    return <div className="animate-pulse h-32 rounded-lg bg-gray-100" />;
  }

  const completed = entries.filter((e) => e.is_completed).length;
  const total = entries.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {error && <Alert variant="error" onDismiss={() => setError('')}>{error}</Alert>}

      {total === 0 ? (
        <Card padding="lg">
          <p className="text-center text-gray-500 py-6">No checklist items for this service type.</p>
        </Card>
      ) : (
        <>
          {/* Progress bar */}
          <Card padding="sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress: {completed}/{total} completed
              </span>
              <span className="text-sm font-semibold text-indigo-600">{percentage}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </Card>

          {/* Checklist items */}
          <Card>
            <ul className="divide-y divide-gray-100">
              {entries.map((entry) => {
                const item = entry.checklist_item;
                return (
                  <li key={entry.id} className="flex items-center gap-3 py-3 px-1">
                    <input
                      type="checkbox"
                      checked={entry.is_completed}
                      onChange={() => handleToggle(item?.id ?? entry.checklist_item_id)}
                      disabled={!canEdit}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-default disabled:opacity-60"
                    />
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm ${entry.is_completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {item?.label ?? `Item #${entry.checklist_item_id}`}
                      </span>
                      {item?.is_required && (
                        <Badge variant="warning" className="ml-2 text-[10px]">Required</Badge>
                      )}
                    </div>
                    {entry.is_completed && entry.completed_at && (
                      <span className="text-xs text-gray-400 shrink-0">
                        {new Date(entry.completed_at).toLocaleDateString()}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
