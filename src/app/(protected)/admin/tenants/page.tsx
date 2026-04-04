'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import {
  Card,
  PageHeader,
  Button,
  Input,
  Select,
  Badge,
  Dialog,
  Alert,
} from '@/components/ui';
import type { Tenant, TenantPlan } from '@/types';

interface TenantFormData {
  name: string;
  slug: string;
  plan: TenantPlan;
  max_users: string;
}

const EMPTY_FORM: TenantFormData = {
  name: '',
  slug: '',
  plan: 'free',
  max_users: '5',
};

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

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<TenantFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchTenants = useCallback(() => {
    setLoading(true);
    api
      .get<{ data: Tenant[] }>('/tenants', undefined, { skipCache: true })
      .then((res) => setTenants(res.data ?? []))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load tenants'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setForm({ ...form, name, slug });
  };

  const handleCreate = async () => {
    setSaving(true);
    setFormErrors({});
    try {
      await api.post('/tenants', {
        name: form.name,
        slug: form.slug,
        plan: form.plan,
        max_users: parseInt(form.max_users, 10),
      });
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      fetchTenants();
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.errors).length > 0) {
        setFormErrors(err.errors);
      } else {
        setError(err instanceof ApiError ? err.message : 'Failed to create tenant');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Tenants"
        subtitle="Manage organizations and their plans"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setForm(EMPTY_FORM);
              setFormErrors({});
              setDialogOpen(true);
            }}
          >
            Create Tenant
          </Button>
        }
      />

      {error && (
        <Alert variant="error" className="mb-4" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <div className="h-32 rounded-lg bg-gray-200 animate-pulse" />
            </Card>
          ))}
        </div>
      ) : tenants.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No tenants found.</p>
            <Button
              variant="primary"
              onClick={() => {
                setForm(EMPTY_FORM);
                setFormErrors({});
                setDialogOpen(true);
              }}
            >
              Create Your First Tenant
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map((tenant) => (
            <Link key={tenant.id} href={`/admin/tenants/${tenant.id}`}>
              <Card variant="interactive" className="h-full">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
                    <p className="text-sm text-gray-500">{tenant.slug}</p>
                  </div>
                  <Badge variant={tenant.is_active ? 'success' : 'danger'}>
                    {tenant.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <Badge variant={PLAN_BADGE[tenant.plan]}>
                    {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}
                  </Badge>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Users</span>
                    <span className="font-medium text-gray-900">
                      {tenant.users_count ?? 0} / {tenant.max_users}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
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
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Create Tenant"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} loading={saving}>
              Create Tenant
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Organization Name"
            required
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            error={formErrors.name?.[0]}
            placeholder="Acme Corporation"
          />
          <Input
            label="Slug"
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            error={formErrors.slug?.[0]}
            placeholder="acme-corporation"
            helperText="URL-friendly identifier (auto-generated from name)"
          />
          <Select
            label="Plan"
            required
            value={form.plan}
            onChange={(e) => setForm({ ...form, plan: e.target.value as TenantPlan })}
            options={PLAN_OPTIONS}
            error={formErrors.plan?.[0]}
          />
          <Input
            label="Max Users"
            required
            type="number"
            min="1"
            value={form.max_users}
            onChange={(e) => setForm({ ...form, max_users: e.target.value })}
            error={formErrors.max_users?.[0]}
          />
        </div>
      </Dialog>
    </div>
  );
}
