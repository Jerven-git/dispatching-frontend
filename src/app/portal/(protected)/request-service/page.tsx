'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { portalApi } from '@/lib/portal-api';
import { Card, Button, Alert, PageHeader, Input } from '@/components/ui';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { usePortalAuth } from '@/contexts/PortalAuthContext';
import type { PortalService, ServiceRequestFormData } from '@/types/portal';
import { CheckCircle } from 'lucide-react';

export default function RequestServicePage() {
  const { customer } = usePortalAuth();
  const router = useRouter();
  const [services, setServices] = useState<PortalService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const { errors, generalError, submitting, handleSubmit } = useFormSubmit();

  const [form, setForm] = useState<ServiceRequestFormData>({
    service_id: '',
    description: '',
    preferred_date: '',
    preferred_time: '',
    address: customer?.address || '',
  });

  useEffect(() => {
    portalApi.get<{ data: PortalService[] }>('/services')
      .then((res) => setServices(res.data))
      .catch(() => {})
      .finally(() => setLoadingServices(false));
  }, []);

  useEffect(() => {
    if (customer?.address && !form.address) {
      setForm((prev) => ({ ...prev, address: customer.address }));
    }
  }, [customer, form.address]);

  const onSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e, async () => {
      await portalApi.post('/service-requests', {
        ...form,
        service_id: Number(form.service_id),
      });
      setSubmitted(true);
    });
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <PageHeader title="Request Service" />
        <Card padding="lg">
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-lg font-semibold text-gray-900">Request Submitted</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Your service request has been submitted. We will review it and get back to you shortly.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="primary" onClick={() => router.push('/portal/requests')}>
                View My Requests
              </Button>
              <Button variant="ghost" onClick={() => { setSubmitted(false); setForm({ service_id: '', description: '', preferred_date: '', preferred_time: '', address: customer?.address || '' }); }}>
                Submit Another
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Request Service" subtitle="Submit a new service request" />

      <Card padding="lg">
        <form onSubmit={onSubmit} className="space-y-5 max-w-xl">
          {generalError && <Alert variant="error">{generalError}</Alert>}

          {/* Service Selection */}
          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
              Service *
            </label>
            {loadingServices ? (
              <p className="text-sm text-gray-400">Loading services...</p>
            ) : (
              <select
                id="service"
                required
                value={form.service_id}
                onChange={(e) => setForm({ ...form, service_id: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
              >
                <option value="">Select a service</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - ${parseFloat(s.base_price).toFixed(2)}
                    {s.estimated_duration_minutes && ` (~${s.estimated_duration_minutes} min)`}
                  </option>
                ))}
              </select>
            )}
            {errors.service_id && <p className="text-xs text-red-600 mt-1">{errors.service_id[0]}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              required
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the issue or service you need..."
            />
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description[0]}</p>}
          </div>

          {/* Preferred Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="preferred_date"
              type="date"
              label="Preferred Date *"
              required
              value={form.preferred_date}
              onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
              error={errors.preferred_date?.[0]}
              fullWidth
            />
            <Input
              id="preferred_time"
              type="time"
              label="Preferred Time"
              value={form.preferred_time}
              onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
              error={errors.preferred_time?.[0]}
              fullWidth
            />
          </div>

          {/* Address */}
          <Input
            id="address"
            type="text"
            label="Service Address *"
            required
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="123 Main St, City"
            error={errors.address?.[0]}
            fullWidth
          />

          <Button type="submit" variant="primary" loading={submitting} size="lg">
            Submit Request
          </Button>
        </form>
      </Card>
    </div>
  );
}
