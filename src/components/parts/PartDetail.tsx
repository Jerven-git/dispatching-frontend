'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { Button, Card, Badge, PageHeader, Alert, Dialog, Input, Textarea } from '@/components/ui';
import type { Part } from '@/types';

interface Props {
  partId: string;
  basePath: string;
}

export default function PartDetail({ partId, basePath }: Props) {
  const [part, setPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustment, setAdjustment] = useState('');
  const [reason, setReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    api.get<{ part: Part }>(`/parts/${partId}`, undefined, { skipCache: true })
      .then((data) => setPart(data.part))
      .catch(() => setError('Failed to load part'))
      .finally(() => setLoading(false));
  }, [partId]);

  const handleAdjust = async () => {
    if (!adjustment) return;
    setAdjusting(true);
    try {
      const data = await api.post<{ part: Part }>(`/parts/${partId}/adjust-stock`, {
        adjustment: parseInt(adjustment), reason,
      });
      setPart(data.part);
      setShowAdjust(false);
      setAdjustment('');
      setReason('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to adjust stock');
    } finally {
      setAdjusting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this part?')) return;
    try {
      await api.delete(`/parts/${partId}`);
      router.push(basePath);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete');
    }
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;
  if (!part) return <Card padding="lg"><p className="text-center text-gray-500">Part not found.</p></Card>;

  const stockPercent = part.minimum_stock > 0
    ? Math.min(100, Math.round((part.stock_quantity / (part.minimum_stock * 3)) * 100))
    : 100;
  const stockColor = part.is_low_stock ? 'bg-red-500' : stockPercent > 60 ? 'bg-green-500' : 'bg-yellow-500';

  return (
    <div>
      {error && <Alert variant="error" className="mb-4" onDismiss={() => setError('')}>{error}</Alert>}

      <PageHeader
        title={part.name}
        backLink={{ href: basePath, label: 'Back to Parts' }}
        actions={
          <>
            <Badge variant={part.is_active ? 'success' : 'default'}>{part.is_active ? 'Active' : 'Inactive'}</Badge>
            {part.is_low_stock && <Badge variant="destructive">Low Stock</Badge>}
            <Button size="sm" variant="outline" onClick={() => setShowAdjust(true)}>Adjust Stock</Button>
            <Link href={`${basePath}/${part.id}/edit`}><Button size="sm">Edit</Button></Link>
            <Button size="sm" variant="destructive" onClick={handleDelete}>Delete</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Part Details</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div><dt className="text-sm font-medium text-gray-500">SKU</dt><dd className="text-sm font-mono">{part.sku}</dd></div>
            <div><dt className="text-sm font-medium text-gray-500">Unit Price</dt><dd className="text-sm font-medium">${parseFloat(part.unit_price).toFixed(2)}</dd></div>
            <div><dt className="text-sm font-medium text-gray-500">Unit</dt><dd className="text-sm capitalize">{part.unit}</dd></div>
            <div><dt className="text-sm font-medium text-gray-500">Created</dt><dd className="text-sm">{new Date(part.created_at).toLocaleDateString()}</dd></div>
            {part.description && (
              <div className="col-span-2"><dt className="text-sm font-medium text-gray-500">Description</dt><dd className="text-sm text-gray-700 mt-1">{part.description}</dd></div>
            )}
          </dl>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Stock Level</h2>
          <div className="text-center mb-4">
            <span className={`text-3xl font-bold ${part.is_low_stock ? 'text-red-600' : 'text-gray-900'}`}>{part.stock_quantity}</span>
            <span className="text-sm text-gray-500 ml-1">{part.unit}(s)</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div className={`h-full ${stockColor} rounded-full transition-all`} style={{ width: `${stockPercent}%` }} />
          </div>
          <p className="text-xs text-gray-500 text-center">Minimum stock: {part.minimum_stock}</p>
        </Card>
      </div>

      <Dialog open={showAdjust} onClose={() => setShowAdjust(false)} title="Adjust Stock">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Current stock: <strong>{part.stock_quantity}</strong>. Enter a positive or negative number.</p>
          <Input label="Adjustment" type="number" value={adjustment} onChange={(e) => setAdjustment(e.target.value)} placeholder="e.g. 10 or -5" />
          <Textarea label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowAdjust(false)}>Cancel</Button>
            <Button onClick={handleAdjust} loading={adjusting} disabled={!adjustment}>Apply</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
