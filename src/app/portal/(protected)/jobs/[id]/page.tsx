'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { portalApi } from '@/lib/portal-api';
import { Card, Badge, Button, PageHeader, Alert } from '@/components/ui';
import { getStatusBadgeVariant, getPriorityBadgeVariant } from '@/components/ui/Badge';
import type { PortalJob, PortalEta, ReviewFormData } from '@/types/portal';
import type { JobStatus } from '@/types';
import { Calendar, MapPin, User, Clock, Navigation, Star } from 'lucide-react';
import { useFormSubmit } from '@/hooks/useFormSubmit';

const STATUS_LABELS: Record<JobStatus, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  on_the_way: 'On the Way',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function PortalJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<PortalJob | null>(null);
  const [eta, setEta] = useState<PortalEta | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewFormData>({ rating: 5, comment: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const { generalError, submitting, handleSubmit } = useFormSubmit();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await portalApi.get<{ data: PortalJob }>(`/jobs/${params.id}`, undefined, { skipCache: true });
        setJob(res.data);

        // Fetch ETA for active jobs
        if (['assigned', 'on_the_way', 'in_progress'].includes(res.data.status)) {
          try {
            const etaRes = await portalApi.get<PortalEta>(`/jobs/${params.id}/eta`);
            setEta(etaRes);
          } catch {
            // ETA not available
          }
        }
      } catch {
        // handled by API client
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [params.id]);

  const onSubmitReview = async (e: React.FormEvent) => {
    await handleSubmit(e, async () => {
      await portalApi.post(`/jobs/${params.id}/review`, reviewData);
      setReviewSubmitted(true);
      setShowReviewForm(false);
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-600 border-t-transparent" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-6">
        <PageHeader title="Job Not Found" backLink="/portal/jobs" />
        <Card padding="lg">
          <p className="text-center text-gray-500">This job could not be found.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={job.reference_number}
        subtitle={job.service.name}
        backLink="/portal/jobs"
      />

      {/* Status + Priority */}
      <div className="flex items-center gap-2">
        <Badge variant={getStatusBadgeVariant(job.status)}>
          {STATUS_LABELS[job.status]}
        </Badge>
        <Badge variant={getPriorityBadgeVariant(job.priority)}>
          {job.priority}
        </Badge>
      </div>

      {/* ETA Banner */}
      {eta && (
        <Card padding="md" className="bg-accent-50 border-accent-200">
          <div className="flex items-start gap-3">
            <Navigation className="h-5 w-5 text-accent-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-accent-800">{eta.message}</p>
              {eta.eta && (
                <p className="text-xs text-accent-600 mt-1">
                  ETA: {new Date(eta.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {eta.distance_km !== null && ` (${eta.distance_km.toFixed(1)} km away)`}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Details */}
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Job Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-gray-500">Scheduled</dt>
                <dd className="text-gray-900 font-medium">
                  {job.scheduled_date}
                  {job.scheduled_time && ` at ${job.scheduled_time}`}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-gray-500">Address</dt>
                <dd className="text-gray-900 font-medium">{job.address}</dd>
              </div>
            </div>
            {job.technician && (
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-gray-500">Technician</dt>
                  <dd className="text-gray-900 font-medium">{job.technician.name}</dd>
                  {job.technician.phone && (
                    <dd className="text-gray-500">{job.technician.phone}</dd>
                  )}
                </div>
              </div>
            )}
            {job.description && (
              <div>
                <dt className="text-gray-500 mb-1">Description</dt>
                <dd className="text-gray-900">{job.description}</dd>
              </div>
            )}
            {job.total_cost && (
              <div>
                <dt className="text-gray-500">Total Cost</dt>
                <dd className="text-gray-900 font-semibold">${parseFloat(job.total_cost).toFixed(2)}</dd>
              </div>
            )}
          </dl>
        </Card>

        {/* Service Info */}
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Service Information</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Service</dt>
              <dd className="text-gray-900 font-medium">{job.service.name}</dd>
            </div>
            {job.service.description && (
              <div>
                <dt className="text-gray-500">Description</dt>
                <dd className="text-gray-900">{job.service.description}</dd>
              </div>
            )}
            <div>
              <dt className="text-gray-500">Base Price</dt>
              <dd className="text-gray-900">${parseFloat(job.service.base_price).toFixed(2)}</dd>
            </div>
            {job.service.estimated_duration_minutes && (
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                Estimated {job.service.estimated_duration_minutes} minutes
              </div>
            )}
          </dl>
        </Card>
      </div>

      {/* Status Timeline */}
      {job.status_logs && job.status_logs.length > 0 && (
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Status History</h3>
          <div className="space-y-3">
            {job.status_logs.map((log, idx) => (
              <div key={log.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`h-3 w-3 rounded-full ${idx === 0 ? 'bg-accent-500' : 'bg-gray-300'}`} />
                  {idx < job.status_logs!.length - 1 && <div className="w-px h-6 bg-gray-200" />}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(log.new_status)}>
                      {STATUS_LABELS[log.new_status]}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  {log.remarks && (
                    <p className="text-xs text-gray-500 mt-1">{log.remarks}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Review Section */}
      {job.status === 'completed' && !reviewSubmitted && (
        <Card padding="lg">
          {!showReviewForm ? (
            <div className="text-center py-2">
              <p className="text-sm text-gray-600 mb-3">How was your experience with this service?</p>
              <Button variant="primary" onClick={() => setShowReviewForm(true)}>
                <Star className="h-4 w-4 mr-1.5" />
                Leave a Review
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmitReview} className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Leave a Review</h3>
              {generalError && <Alert variant="error">{generalError}</Alert>}

              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className="p-0.5"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= reviewData.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                  Comment (optional)
                </label>
                <textarea
                  id="comment"
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  placeholder="Tell us about your experience..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" variant="primary" loading={submitting}>
                  Submit Review
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowReviewForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Card>
      )}

      {reviewSubmitted && (
        <Alert variant="success">Thank you for your review!</Alert>
      )}

      <div className="flex">
        <Button variant="ghost" onClick={() => router.push('/portal/jobs')}>
          Back to My Jobs
        </Button>
      </div>
    </div>
  );
}
