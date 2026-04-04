'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import {
  Card,
  PageHeader,
  Button,
  Input,
  Select,
  Badge,
  Alert,
} from '@/components/ui';
import type { Tenant, TenantPlan } from '@/types';

const PLAN_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: 'basic', label: 'Basic' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];

const PLAN_BADGE: Record<TenantPlan, 'neutral' | 'info' | 'primary' | 'accent'> = {
  free: 'neutral',
  basic: 'info',
  pro: 'primary',
  enterprise: 'accent',
};

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  // Editable fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [domain, setDomain] = useState('');
  const [plan, setPlan] = useState<TenantPlan>('free');
  const [maxUsers, setMaxUsers] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [settings, setSettings] = useState('');

  const fetchTenant = useCallback(() => {
    setLoading(true);
    api
      .get<{ data: Tenant }>(`/tenants/${tenantId}`, undefined, { skipCache: true })
      .then((res) => {
        const t = res.data;
        setTenant(t);
        setName(t.name);
        setSlug(t.slug);
        setDomain(t.domain || '');
        setPlan(t.plan);
        setMaxUsers(String(t.max_users));
        setIsActive(t.is_active);
        setSettings(t.settings ? JSON.stringify(t.settings, null, 2) : '{}');
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load tenant'))
      .finally(() => setLoading(false));
  }, [tenantId]);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    setFormErrors({});

    let parsedSettings: Record<string, unknown> = {};
    try {
      parsedSettings = JSON.parse(settings);
    } catch {
      setFormErrors({ settings: ['Invalid JSON'] });
      setSaving(false);
      return;
    }

    try {
      await api.put(`/tenants/${tenantId}`, {
        name,
        slug,
        domain: domain || null,
        plan,
        max_users: parseInt(maxUsers, 10),
        is_active: isActive,
        settings: parsedSettings,
      });
      setSuccess('Tenant updated successfully.');
      fetchTenant();
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.errors).length > 0) {
        setFormErrors(err.errors);
      } else {
        setError(err instanceof ApiError ? err.message : 'Failed to update tenant');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/tenants/${tenantId}`);
      router.push('/admin/tenants');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete tenant');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Tenant Detail"
          backLink={{ href: '/admin/tenants', label: 'Back to Tenants' }}
        />
        <Card>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-gray-200 animate-pulse" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div>
        <PageHeader
          title="Tenant Not Found"
          backLink={{ href: '/admin/tenants', label: 'Back to Tenants' }}
        />
        <Alert variant="error">The requested tenant could not be found.</Alert>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={tenant.name}
        subtitle={`Slug: ${tenant.slug}`}
        backLink={{ href: '/admin/tenants', label: 'Back to Tenants' }}
        actions={
          <div className="flex items-center gap-3">
            <Badge variant={PLAN_BADGE[tenant.plan]}>
              {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)} Plan
            </Badge>
            <Badge variant={tenant.is_active ? 'success' : 'danger'}>
              {tenant.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        }
      />

      {error && (
        <Alert variant="error" className="mb-4" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-4" onDismiss={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* User Count Summary */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Current Users</p>
            <p className="text-2xl font-bold text-gray-900">
              {tenant.users_count ?? 0} <span className="text-base font-normal text-gray-400">/ {tenant.max_users}</span>
            </p>
          </div>
          <div className="w-48">
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  (tenant.users_count ?? 0) >= tenant.max_users
                    ? 'bg-red-500'
                    : (tenant.users_count ?? 0) / tenant.max_users > 0.8
                      ? 'bg-amber-500'
                      : 'bg-indigo-500'
                }`}
                style={{
                  width: `${Math.min(((tenant.users_count ?? 0) / tenant.max_users) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Form */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Tenant</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={formErrors.name?.[0]}
          />
          <Input
            label="Slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            error={formErrors.slug?.[0]}
          />
          <Input
            label="Domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            error={formErrors.domain?.[0]}
            placeholder="e.g. acme.example.com"
          />
          <Select
            label="Plan"
            required
            value={plan}
            onChange={(e) => setPlan(e.target.value as TenantPlan)}
            options={PLAN_OPTIONS}
            error={formErrors.plan?.[0]}
          />
          <Input
            label="Max Users"
            required
            type="number"
            min="1"
            value={maxUsers}
            onChange={(e) => setMaxUsers(e.target.value)}
            error={formErrors.max_users?.[0]}
          />
          <div className="flex items-center gap-3 pt-6">
            <label className="text-sm font-medium text-gray-700">Active</label>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isActive ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Settings (JSON)</label>
          <textarea
            value={settings}
            onChange={(e) => setSettings(e.target.value)}
            rows={4}
            className={`block w-full px-3 py-2.5 rounded-lg border transition-colors duration-150 placeholder:text-gray-400 text-sm bg-white font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 ${
              formErrors.settings
                ? 'border-red-300 focus-visible:ring-red-500'
                : 'border-gray-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-300'
            }`}
          />
          {formErrors.settings && (
            <p className="mt-1 text-sm text-red-600">{formErrors.settings[0]}</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div>
            {(tenant.users_count ?? 0) === 0 && (
              <Button variant="destructive" onClick={handleDelete} loading={deleting}>
                Delete Tenant
              </Button>
            )}
            {(tenant.users_count ?? 0) > 0 && (
              <p className="text-sm text-gray-400">Cannot delete tenant with active users</p>
            )}
          </div>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
}
