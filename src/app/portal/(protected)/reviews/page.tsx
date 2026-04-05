'use client';

import { useEffect, useState } from 'react';
import { portalApi } from '@/lib/portal-api';
import { Card, PageHeader } from '@/components/ui';
import type { PortalReview } from '@/types/portal';
import type { PaginatedResponse } from '@/types';
import { Star } from 'lucide-react';

export default function PortalReviewsPage() {
  const [reviews, setReviews] = useState<PortalReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portalApi.get<PaginatedResponse<PortalReview>>('/reviews', undefined, { skipCache: true })
      .then((res) => setReviews(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="My Reviews" subtitle="Reviews you have left for completed jobs" />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-600 border-t-transparent" />
        </div>
      ) : reviews.length === 0 ? (
        <Card padding="lg">
          <p className="text-center text-gray-500">No reviews yet. Complete a job to leave a review.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id} padding="md">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {review.service_job.reference_number}
                    </p>
                    <p className="text-xs text-gray-500">{review.service_job.service?.name}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Star Rating */}
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {review.comment && (
                  <p className="text-sm text-gray-600">{review.comment}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
