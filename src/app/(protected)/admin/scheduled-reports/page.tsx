'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';
import {
  Card,
  PageHeader,
  Button,
  Input,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Badge,
  Dialog,
  Alert,
} from '@/components/ui';
import type { ScheduledReport } from '@/types';

interface ReportFormData {
  name: string;
  report_type: string;
  frequency: string;
  recipients: string;
  is_active: boolean;
}

const EMPTY_FORM: ReportFormData = {
  name: '',
  report_type: 'jobs_summary',
  frequency: 'weekly',
  recipients: '',
  is_active: true,
};

const REPORT_TYPES = [
  { value: 'jobs_summary', label: 'Jobs Summary' },
  { value: 'revenue', label: 'Revenue Report' },
  { value: 'technician_performance', label: 'Technician Performance' },
  { value: 'customer_activity', label: 'Customer Activity' },
  { value: 'inventory', label: 'Inventory Report' },
];

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const FREQUENCY_BADGE: Record<string, 'info' | 'primary' | 'accent'> = {
  daily: 'info',
  weekly: 'primary',
  monthly: 'accent',
};

export default function ScheduledReportsPage() {
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduledReport | null>(null);
  const [form, setForm] = useState<ReportFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchReports = useCallback(() => {
    setLoading(true);
    api
      .get<{ data: ScheduledReport[] }>('/scheduled-reports', undefined, { skipCache: true })
      .then((res) => setReports(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEdit = (report: ScheduledReport) => {
    setEditing(report);
    setForm({
      name: report.name,
      report_type: report.report_type,
      frequency: report.frequency,
      recipients: report.recipients.join(', '),
      is_active: report.is_active,
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    try {
      const payload = {
        name: form.name,
        report_type: form.report_type,
        frequency: form.frequency,
        recipients: form.recipients
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean),
        is_active: form.is_active,
      };

      if (editing) {
        await api.put(`/scheduled-reports/${editing.id}`, payload);
      } else {
        await api.post('/scheduled-reports', payload);
      }
      setDialogOpen(false);
      fetchReports();
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.errors).length > 0) {
        setFormErrors(err.errors);
      } else {
        setError(err instanceof ApiError ? err.message : 'Failed to save report');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this scheduled report?')) return;
    setDeleting(id);
    try {
      await api.delete(`/scheduled-reports/${id}`);
      fetchReports();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete report');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (report: ScheduledReport) => {
    try {
      await api.put(`/scheduled-reports/${report.id}`, {
        ...report,
        is_active: !report.is_active,
      });
      fetchReports();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update report');
    }
  };

  const getReportTypeLabel = (type: string) =>
    REPORT_TYPES.find((t) => t.value === type)?.label || type;

  return (
    <div>
      <PageHeader
        title="Scheduled Reports"
        subtitle="Manage automated report delivery"
        actions={
          <Button variant="primary" onClick={openCreate}>
            Create Report
          </Button>
        }
      />

      {error && (
        <Alert variant="error" className="mb-4" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Card>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-gray-200 animate-pulse" />
            ))}
          </div>
        </Card>
      ) : reports.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No scheduled reports yet.</p>
            <Button variant="primary" onClick={openCreate}>
              Create Your First Report
            </Button>
          </div>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead className="text-center">Recipients</TableHead>
              <TableHead className="text-center">Active</TableHead>
              <TableHead>Last Sent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.name}</TableCell>
                <TableCell className="text-gray-600">
                  {getReportTypeLabel(report.report_type)}
                </TableCell>
                <TableCell>
                  <Badge variant={FREQUENCY_BADGE[report.frequency] || 'neutral'}>
                    {report.frequency}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{report.recipients.length}</TableCell>
                <TableCell className="text-center">
                  <button
                    onClick={() => handleToggleActive(report)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      report.is_active ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                    aria-label={report.is_active ? 'Deactivate' : 'Activate'}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        report.is_active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </TableCell>
                <TableCell className="text-gray-600">
                  {report.last_sent_at
                    ? new Date(report.last_sent_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Never'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(report)}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      disabled={deleting === report.id}
                      className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                    >
                      {deleting === report.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create / Edit Dialog */}
      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? 'Edit Scheduled Report' : 'Create Scheduled Report'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              {editing ? 'Update Report' : 'Create Report'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Report Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={formErrors.name?.[0]}
            placeholder="e.g. Weekly Jobs Summary"
          />
          <Select
            label="Report Type"
            required
            value={form.report_type}
            onChange={(e) => setForm({ ...form, report_type: e.target.value })}
            options={REPORT_TYPES}
            error={formErrors.report_type?.[0]}
          />
          <Select
            label="Frequency"
            required
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            options={FREQUENCIES}
            error={formErrors.frequency?.[0]}
          />
          <Input
            label="Recipients"
            required
            value={form.recipients}
            onChange={(e) => setForm({ ...form, recipients: e.target.value })}
            error={formErrors.recipients?.[0]}
            placeholder="email1@example.com, email2@example.com"
            helperText="Comma-separated email addresses"
          />
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Active</label>
            <button
              type="button"
              onClick={() => setForm({ ...form, is_active: !form.is_active })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.is_active ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  form.is_active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
