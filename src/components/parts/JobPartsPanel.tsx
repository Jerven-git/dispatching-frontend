'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { Button, Card, Alert, Dialog, Input, Select } from '@/components/ui';
import type { JobPart, Part } from '@/types';

interface Props {
  jobId: number;
  canEdit: boolean;
}

export default function JobPartsPanel({ jobId, canEdit }: Props) {
  const [jobParts, setJobParts] = useState<JobPart[]>([]);
  const [totalCost, setTotalCost] = useState('0.00');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [adding, setAdding] = useState(false);

  const fetchParts = () => {
    api.get<{ parts: JobPart[]; total_parts_cost: string }>(`/service-jobs/${jobId}/parts`, undefined, { skipCache: true })
      .then((data) => { setJobParts(data.parts); setTotalCost(data.total_parts_cost); })
      .catch(() => setError('Failed to load parts'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchParts(); }, [jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAddDialog = async () => {
    try {
      const data = await api.get<{ data: Part[] }>('/parts', { is_active: '1', per_page: '100' });
      setParts(data.data);
      setShowAdd(true);
    } catch {
      setError('Failed to load parts catalog');
    }
  };

  const handleAdd = async () => {
    if (!selectedPartId || !quantity) return;
    setAdding(true);
    try {
      await api.post(`/service-jobs/${jobId}/parts`, { part_id: parseInt(selectedPartId), quantity: parseInt(quantity) });
      setShowAdd(false);
      setSelectedPartId('');
      setQuantity('1');
      fetchParts();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add part');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (partId: number) => {
    if (!confirm('Remove this part from the job?')) return;
    try {
      await api.delete(`/service-jobs/${jobId}/parts/${partId}`);
      fetchParts();
    } catch {
      setError('Failed to remove part');
    }
  };

  if (loading) return <div className="animate-pulse h-24 bg-gray-100 rounded-lg" />;

  return (
    <Card>
      {error && <Alert variant="error" className="mb-3" onDismiss={() => setError('')}>{error}</Alert>}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Parts Used</h2>
        {canEdit && <Button size="sm" onClick={openAddDialog}>Add Part</Button>}
      </div>

      {jobParts.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">No parts added to this job.</p>
      ) : (
        <>
          <div className="divide-y divide-gray-100">
            {jobParts.map((jp) => (
              <div key={jp.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{jp.part?.name}</p>
                  <p className="text-xs text-gray-500">{jp.part?.sku} &middot; {jp.quantity} x ${parseFloat(jp.unit_price).toFixed(2)}</p>
                  {jp.notes && <p className="text-xs text-gray-400 mt-0.5">{jp.notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">${parseFloat(jp.total_price).toFixed(2)}</span>
                  {canEdit && (
                    <button onClick={() => handleRemove(jp.id)} className="text-gray-400 hover:text-red-500 text-sm">✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between">
            <span className="text-sm font-medium text-gray-500">Total Parts Cost</span>
            <span className="text-sm font-semibold">${totalCost}</span>
          </div>
        </>
      )}

      <Dialog open={showAdd} onClose={() => setShowAdd(false)} title="Add Part to Job">
        <div className="space-y-4">
          <Select
            label="Part"
            value={selectedPartId}
            onChange={(e) => setSelectedPartId(e.target.value)}
            options={[
              { value: '', label: 'Select a part...' },
              ...parts.map((p) => ({ value: String(p.id), label: `${p.name} (${p.sku}) - $${parseFloat(p.unit_price).toFixed(2)} — Stock: ${p.stock_quantity}` })),
            ]}
          />
          <Input label="Quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} loading={adding} disabled={!selectedPartId}>Add</Button>
          </div>
        </div>
      </Dialog>
    </Card>
  );
}
