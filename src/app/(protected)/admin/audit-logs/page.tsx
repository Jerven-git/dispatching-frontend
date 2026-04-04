'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';
import {
  Card,
  PageHeader,
  Input,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Badge,
  Pagination,
  Alert,
} from '@/components/ui';
import type { AuditLog, PaginatedResponse, User } from '@/types';

const ACTION_BADGE: Record<string, 'success' | 'info' | 'danger'> = {
  created: 'success',
  updated: 'info',
  deleted: 'danger',
};

const ACTION_OPTIONS = [
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
  { value: 'deleted', label: 'Deleted' },
];

function formatResourceType(type: string | null): string {
  if (!type) return '-';
  // Convert "App\\Models\\ServiceJob" → "Service Job"
  const name = type.split('\\').pop() || type;
  return name.replace(/([A-Z])/g, ' $1').trim();
}

function JsonDiff({ label, data }: { label: string; data: Record<string, unknown> | null }) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <pre className="text-xs bg-gray-50 rounded-lg p-3 overflow-x-auto text-gray-700 whitespace-pre-wrap break-words">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginatedResponse<AuditLog>['meta'] | null>(null);

  // Filters
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  // Expanded row
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchUsers = useCallback(() => {
    api
      .get<PaginatedResponse<User>>('/users', { per_page: '100' })
      .then((res) => setUsers(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const fetchLogs = useCallback(
    (pageNum: number) => {
      setLoading(true);
      const params: Record<string, string> = { page: String(pageNum) };
      if (action) params.action = action;
      if (from) params.from = from;
      if (to) params.to = to;
      if (userId) params.user_id = userId;

      api
        .get<PaginatedResponse<AuditLog>>('/audit-logs', params, { skipCache: true })
        .then((res) => {
          setLogs(res.data);
          setMeta(res.meta);
        })
        .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load audit logs'))
        .finally(() => setLoading(false));
    },
    [action, from, to, userId]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchLogs(page);
    }, 300);
    return () => clearTimeout(timeout);
  }, [page, fetchLogs]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [action, from, to, userId]);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const userOptions = users.map((u) => ({ value: String(u.id), label: u.name }));

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Track system activity and changes" />

      {error && (
        <Alert variant="error" className="mb-4" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <Select
            label="User"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            options={userOptions}
            placeholder="All Users"
          />
          <Select
            label="Action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            options={ACTION_OPTIONS}
            placeholder="All Actions"
          />
          <Input
            label="From"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <Input
            label="To"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          {(action || from || to || userId) && (
            <button
              onClick={() => {
                setAction('');
                setFrom('');
                setTo('');
                setUserId('');
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium pb-2.5"
            >
              Clear Filters
            </button>
          )}
        </div>
      </Card>

      {loading ? (
        <Card>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-gray-200 animate-pulse" />
            ))}
          </div>
        </Card>
      ) : logs.length === 0 ? (
        <Card padding="lg">
          <p className="text-center text-gray-500 py-8">No audit logs found for the selected filters.</p>
        </Card>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource Type</TableHead>
                <TableHead>Resource ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <React.Fragment key={log.id}>
                  <TableRow
                    onClick={() => toggleExpand(log.id)}
                    className="cursor-pointer"
                  >
                    <TableCell className="w-8 text-center">
                      <svg
                        className={`h-4 w-4 text-gray-400 transition-transform inline-block ${
                          expandedId === log.id ? 'rotate-90' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-gray-600 text-sm">
                      {new Date(log.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      {new Date(log.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {log.user ? (
                        <div>
                          <p className="font-medium text-sm">{log.user.name}</p>
                          <p className="text-xs text-gray-500">{log.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">System</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ACTION_BADGE[log.action] || 'neutral'}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {formatResourceType(log.auditable_type)}
                    </TableCell>
                    <TableCell className="text-gray-600 font-mono text-sm">
                      {log.auditable_id ?? '-'}
                    </TableCell>
                  </TableRow>

                  {/* Expanded Row */}
                  {expandedId === log.id && (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                          <JsonDiff label="Old Values" data={log.old_values} />
                          <JsonDiff label="New Values" data={log.new_values} />
                          {!log.old_values && !log.new_values && (
                            <p className="text-sm text-gray-400 col-span-2">
                              No detailed change data available.
                            </p>
                          )}
                        </div>
                        {log.ip_address && (
                          <p className="mt-3 text-xs text-gray-400">
                            IP Address: {log.ip_address}
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>

          {meta && meta.last_page > 1 && (
            <Pagination
              currentPage={meta.current_page}
              totalPages={meta.last_page}
              totalItems={meta.total}
              itemsPerPage={meta.per_page}
              onPageChange={setPage}
              className="mt-4"
            />
          )}
        </>
      )}
    </div>
  );
}
