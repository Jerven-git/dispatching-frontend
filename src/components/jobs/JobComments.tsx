'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Button, Card, Alert, Textarea } from '@/components/ui';
import type { JobComment } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  jobId: number;
  canEdit: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function JobComments({ jobId, canEdit }: Props) {
  const { user } = useAuth();
  const [comments, setComments] = useState<JobComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const fetchComments = () => {
    api
      .get<{ comments: JobComment[] }>(`/service-jobs/${jobId}/comments`, undefined, { skipCache: true })
      .then((data) => setComments(data.comments))
      .catch(() => setError('Failed to load comments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handlePost = async () => {
    if (!body.trim()) return;
    setPosting(true);
    setError('');
    try {
      await api.post(`/service-jobs/${jobId}/comments`, { body: body.trim(), is_internal: false });
      setBody('');
      fetchComments();
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 100);
    } catch {
      setError('Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await api.delete(`/service-jobs/${jobId}/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError('Failed to delete comment');
    }
  };

  if (loading) {
    return <div className="animate-pulse h-32 rounded-lg bg-gray-100" />;
  }

  return (
    <div className="space-y-4">
      {error && <Alert variant="error" onDismiss={() => setError('')}>{error}</Alert>}

      {comments.length === 0 ? (
        <Card padding="lg">
          <p className="text-center text-gray-500 py-6">No comments yet. Start the conversation.</p>
        </Card>
      ) : (
        <div ref={listRef} className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {comments.map((comment) => (
            <Card key={comment.id} padding="sm">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                  {(comment.user?.name ?? 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{comment.user?.name ?? 'Unknown'}</span>
                      <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                    </div>
                    {canEdit && user?.id === comment.user_id && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors text-xs"
                        title="Delete"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{comment.body}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New comment */}
      {canEdit && (
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Textarea
              placeholder="Write a comment..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={2}
            />
          </div>
          <Button onClick={handlePost} loading={posting} disabled={!body.trim()}>
            Post
          </Button>
        </div>
      )}
    </div>
  );
}
