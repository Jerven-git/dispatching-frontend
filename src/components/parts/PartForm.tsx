'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { Button, Card, PageHeader, Input, Textarea, Select, Alert } from '@/components/ui';
import type { Part, PartFormData } from '@/types';

interface Props {
  partId?: string;
  basePath: string;
}

const unitOptions = [
  { value: 'piece', label: 'Piece' },
  { value: 'meter', label: 'Meter' },
  { value: 'liter', label: 'Liter' },
  { value: 'kg', label: 'Kilogram' },
  { value: 'box', label: 'Box' },
];

export default function PartForm({ partId, basePath }: Props) {
  const router = useRouter();
  const isEditing = !!partId;
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [form, setForm] = useState<PartFormData>({
    name: '', description: '', sku: '', unit_price: '', stock_quantity: '0',
    minimum_stock: '0', unit: 'piece', is_active: true,
  });

  useEffect(() => {
    if (!partId) return;
    api.get<{ part: Part }>(`/parts/${partId}`)
      .then((data) => {
        const p = data.part;
        setForm({
          name: p.name, description: p.description ?? '', sku: p.sku,
          unit_price: p.unit_price, stock_quantity: String(p.stock_quantity),
          minimum_stock: String(p.minimum_stock), unit: p.unit, is_active: p.is_active,
        });
      })
      .catch(() => setError('Failed to load part'))
      .finally(() => setLoading(false));
  }, [partId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      if (isEditing) {
        await api.put(`/parts/${partId}`, form);
      } else {
        await api.post('/parts', form);
      }
      router.push(basePath);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: keyof PartFormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Edit Part' : 'New Part'}
        backLink={{ href: basePath, label: 'Back to Parts' }}
      />

      {error && <Alert variant="error" className="mb-4" onDismiss={() => setError('')}>{error}</Alert>}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => update('name', e.target.value)} error={fieldErrors.name?.[0]} required />
            <Input label="SKU" value={form.sku} onChange={(e) => update('sku', e.target.value)} error={fieldErrors.sku?.[0]} required />
            <Input label="Unit Price" type="number" step="0.01" min="0" value={form.unit_price} onChange={(e) => update('unit_price', e.target.value)} error={fieldErrors.unit_price?.[0]} required />
            <Select label="Unit" value={form.unit} onChange={(e) => update('unit', e.target.value)} options={unitOptions} />
            <Input label="Stock Quantity" type="number" min="0" value={form.stock_quantity} onChange={(e) => update('stock_quantity', e.target.value)} error={fieldErrors.stock_quantity?.[0]} required />
            <Input label="Minimum Stock" type="number" min="0" value={form.minimum_stock} onChange={(e) => update('minimum_stock', e.target.value)} />
          </div>
          <Textarea label="Description" value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={submitting}>{isEditing ? 'Update Part' : 'Create Part'}</Button>
            <Button type="button" variant="outline" onClick={() => router.push(basePath)}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
