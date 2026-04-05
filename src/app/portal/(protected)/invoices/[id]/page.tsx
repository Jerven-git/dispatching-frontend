'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { portalApi } from '@/lib/portal-api';
import { Card, Badge, Button, PageHeader } from '@/components/ui';
import { getStatusBadgeVariant } from '@/components/ui/Badge';
import type { PortalInvoice } from '@/types/portal';
import type { InvoiceStatus } from '@/types';
import { Download, Calendar, FileText } from 'lucide-react';

const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

export default function PortalInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<PortalInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await portalApi.get<{ data: PortalInvoice }>(`/invoices/${params.id}`, undefined, { skipCache: true });
        setInvoice(res.data);
      } catch {
        // handled by API client
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [params.id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await portalApi.download(`/invoices/${params.id}/pdf`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice?.invoice_number || 'invoice'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // download failed
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-600 border-t-transparent" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <PageHeader title="Invoice Not Found" backLink="/portal/invoices" />
        <Card padding="lg">
          <p className="text-center text-gray-500">This invoice could not be found.</p>
        </Card>
      </div>
    );
  }

  const isOverdue = invoice.status === 'sent' && new Date(invoice.due_date) < new Date();

  return (
    <div className="space-y-6">
      <PageHeader
        title={invoice.invoice_number}
        backLink="/portal/invoices"
        actions={
          <Button variant="primary" onClick={handleDownload} loading={downloading}>
            <Download className="h-4 w-4 mr-1.5" />
            Download PDF
          </Button>
        }
      />

      {/* Status */}
      <div className="flex items-center gap-2">
        <Badge variant={getStatusBadgeVariant(invoice.status)}>
          {INVOICE_STATUS_LABELS[invoice.status]}
        </Badge>
        {isOverdue && <Badge variant="danger">Overdue</Badge>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Invoice Details */}
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" />
            Invoice Details
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Invoice Number</dt>
              <dd className="text-gray-900 font-medium">{invoice.invoice_number}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Issued Date</dt>
              <dd className="text-gray-900">{invoice.issued_date}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Due Date
              </dt>
              <dd className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                {invoice.due_date}
              </dd>
            </div>
            {invoice.paid_at && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Paid On</dt>
                <dd className="text-green-600 font-medium">{invoice.paid_at}</dd>
              </div>
            )}
          </dl>
        </Card>

        {/* Amount Breakdown */}
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Amount</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Subtotal</dt>
              <dd className="text-gray-900">${parseFloat(invoice.subtotal).toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Tax ({parseFloat(invoice.tax_rate).toFixed(1)}%)</dt>
              <dd className="text-gray-900">${parseFloat(invoice.tax_amount).toFixed(2)}</dd>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <dt className="text-gray-900 font-semibold">Total</dt>
              <dd className="text-gray-900 text-lg font-bold">${parseFloat(invoice.total).toFixed(2)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Related Job */}
      {invoice.service_job && (
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Related Job</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{invoice.service_job.reference_number}</p>
              <p className="text-xs text-gray-500">{invoice.service_job.service?.name}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/portal/jobs/${invoice.service_job.id}`)}>
              View Job
            </Button>
          </div>
        </Card>
      )}

      {/* Notes */}
      {invoice.notes && (
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
          <p className="text-sm text-gray-600">{invoice.notes}</p>
        </Card>
      )}

      <div className="flex">
        <Button variant="ghost" onClick={() => router.push('/portal/invoices')}>
          Back to My Invoices
        </Button>
      </div>
    </div>
  );
}
