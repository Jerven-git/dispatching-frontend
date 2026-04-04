'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Button, Card, Badge, Alert, Select } from '@/components/ui';
import type { JobAttachment, AttachmentCategory } from '@/types';

interface Props {
  jobId: number;
  canEdit: boolean;
}

const categories: AttachmentCategory[] = ['before', 'after', 'document', 'other'];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const categoryVariant: Record<AttachmentCategory, string> = {
  before: 'info',
  after: 'success',
  document: 'warning',
  other: 'default',
};

export default function JobAttachments({ jobId, canEdit }: Props) {
  const [attachments, setAttachments] = useState<JobAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<AttachmentCategory | 'all'>('all');
  const [uploadCategory, setUploadCategory] = useState<AttachmentCategory>('other');
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchAttachments = () => {
    api
      .get<{ attachments: JobAttachment[] }>(`/service-jobs/${jobId}/attachments`, undefined, { skipCache: true })
      .then((data) => setAttachments(data.attachments))
      .catch(() => setError('Failed to load attachments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAttachments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', uploadCategory);

    setUploading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/api/service-jobs/${jobId}/attachments`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'X-XSRF-TOKEN': decodeURIComponent(
            document.cookie.split('; ').find((r) => r.startsWith('XSRF-TOKEN='))?.split('=')[1] ?? ''
          ),
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Upload failed');
      }
      fetchAttachments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this attachment?')) return;
    try {
      await api.delete(`/service-jobs/${jobId}/attachments/${id}`);
      setAttachments((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError('Failed to delete attachment');
    }
  };

  const filtered = filter === 'all' ? attachments : attachments.filter((a) => a.category === filter);

  if (loading) {
    return <div className="animate-pulse h-32 rounded-lg bg-gray-100" />;
  }

  return (
    <div className="space-y-4">
      {error && <Alert variant="error" onDismiss={() => setError('')}>{error}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${filter === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All ({attachments.length})
          </button>
          {categories.map((cat) => {
            const count = attachments.filter((a) => a.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full capitalize transition-colors ${filter === cat ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <Select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value as AttachmentCategory)}
              options={categories.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
            />
            <Button size="sm" onClick={() => fileRef.current?.click()} loading={uploading}>
              Upload File
            </Button>
            <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" />
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card padding="lg">
          <p className="text-center text-gray-500 py-6">No attachments yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((att) => (
            <Card key={att.id} padding="sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{att.file_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={categoryVariant[att.category] as 'info' | 'success' | 'warning' | 'default'}>
                      {att.category}
                    </Badge>
                    <span className="text-xs text-gray-500">{formatFileSize(att.file_size)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(att.created_at).toLocaleDateString()}
                  </p>
                </div>
                {canEdit && (
                  <button
                    onClick={() => handleDelete(att.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                    title="Delete"
                  >
                    ✕
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
