'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { portalApi } from '@/lib/portal-api';
import { Card, Badge, Pagination, PageHeader } from '@/components/ui';
import { getStatusBadgeVariant } from '@/components/ui/Badge';
import type { PortalInvoice } from '@/types/portal';
import type { PaginatedResponse, InvoiceStatus } from '@/types';
import { Calendar, DollarSign, ChevronRight } from 'lucide-react';

const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (status) params.status = status;
      const res = await portalApi.get<PaginatedResponse<PortalInvoice>>('/invoices', params, { skipCache: true });
      setInvoices(res.data);
      setMeta(res.meta);
    } catch {
      // handled by API client
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="space-y-6">
      <PageHeader title="My Invoices" subtitle="View and download your invoices" />

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['', 'draft', 'sent', 'paid', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              status === s
                ? 'bg-accent-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {s ? INVOICE_STATUS_LABELS[s as InvoiceStatus] : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-600 border-t-transparent" />
        </div>
      ) : invoices.length === 0 ? (
        <Card padding="lg">
          <p className="text-center text-gray-500">No invoices found.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <Link key={invoice.id} href={`/portal/invoices/${invoice.id}`}>
              <Card variant="interactive" padding="md" className="mb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{invoice.invoice_number}</span>
                      <Badge variant={getStatusBadgeVariant(invoice.status)}>
                        {INVOICE_STATUS_LABELS[invoice.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span className="font-semibold text-gray-900">${parseFloat(invoice.total).toFixed(2)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Due: {invoice.due_date}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 shrink-0 ml-2" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {meta.last_page > 1 && (
        <Pagination
          currentPage={meta.current_page}
          totalPages={meta.last_page}
          totalItems={meta.total}
          itemsPerPage={meta.per_page}
          onPageChange={fetchInvoices}
        />
      )}
    </div>
  );
}
