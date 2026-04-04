'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button, Card, Badge, PageHeader, Alert } from '@/components/ui';
import type { Invoice } from '@/types';

interface Props {
  invoiceId: string;
  basePath: string;
}

const statusVariant: Record<string, 'default' | 'info' | 'success' | 'destructive'> = {
  draft: 'default', sent: 'info', paid: 'success', cancelled: 'destructive',
};

export default function InvoiceDetail({ invoiceId, basePath }: Props) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    api
      .get<{ invoice: Invoice }>(`/invoices/${invoiceId}`, undefined, { skipCache: true })
      .then((data) => setInvoice(data.invoice))
      .catch(() => setError('Failed to load invoice'))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const markAs = async (action: 'sent' | 'paid') => {
    setUpdating(true);
    try {
      const data = await api.patch<{ invoice: Invoice }>(`/invoices/${invoiceId}/${action}`);
      setInvoice(data.invoice);
    } catch {
      setError(`Failed to mark as ${action}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this invoice?')) return;
    try {
      await api.delete(`/invoices/${invoiceId}`);
      router.push(basePath);
    } catch {
      setError('Failed to delete invoice');
    }
  };

  const downloadPdf = () => {
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    window.open(`${BASE_URL}/api/invoices/${invoiceId}/pdf`, '_blank');
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;
  if (!invoice) return <Card padding="lg"><p className="text-center text-gray-500">Invoice not found.</p></Card>;

  return (
    <div>
      {error && <Alert variant="error" onDismiss={() => setError('')}>{error}</Alert>}

      <PageHeader
        title={invoice.invoice_number}
        backLink={{ href: basePath, label: 'Back to Invoices' }}
        actions={
          <>
            <Badge variant={statusVariant[invoice.status] ?? 'default'} className="text-sm">
              {invoice.status.toUpperCase()}
            </Badge>
            <Button variant="outline" size="sm" onClick={downloadPdf}>Download PDF</Button>
            {invoice.status === 'draft' && (
              <Button size="sm" onClick={() => markAs('sent')} loading={updating}>Mark Sent</Button>
            )}
            {invoice.status === 'sent' && (
              <Button size="sm" onClick={() => markAs('paid')} loading={updating}
                className="bg-green-600 hover:bg-green-700">
                Mark Paid
              </Button>
            )}
            {(invoice.status === 'draft' || invoice.status === 'sent') && (
              <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
          <dl className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Customer</dt>
              <dd className="text-sm text-gray-900">{invoice.customer?.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Job Reference</dt>
              <dd className="text-sm text-indigo-600">{invoice.service_job?.reference_number}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Issued Date</dt>
              <dd className="text-sm text-gray-900">{invoice.issued_date}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Due Date</dt>
              <dd className="text-sm text-gray-900">{invoice.due_date}</dd>
            </div>
            {invoice.paid_at && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Paid At</dt>
                <dd className="text-sm text-green-700">{new Date(invoice.paid_at).toLocaleString()}</dd>
              </div>
            )}
          </dl>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">${parseFloat(invoice.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax ({invoice.tax_rate}%)</span>
              <span className="text-gray-900">${parseFloat(invoice.tax_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-2">
              <span>Total</span>
              <span>${parseFloat(invoice.total).toFixed(2)}</span>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Status</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${invoice.status === 'paid' ? 'bg-green-500' : invoice.status === 'sent' ? 'bg-blue-500' : invoice.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium capitalize">{invoice.status}</span>
            </div>
            <p className="text-xs text-gray-500">
              Created {new Date(invoice.created_at).toLocaleDateString()}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
