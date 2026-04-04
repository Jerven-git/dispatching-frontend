'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Button, Card, Badge, PageHeader,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  Pagination, Select, Input,
} from '@/components/ui';
import type { Invoice, PaginatedResponse } from '@/types';

interface Props {
  basePath: string;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusVariant: Record<string, 'default' | 'info' | 'success' | 'destructive'> = {
  draft: 'default',
  sent: 'info',
  paid: 'success',
  cancelled: 'destructive',
};

export default function InvoiceList({ basePath }: Props) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page) };
    if (status) params.status = status;
    if (from) params.from = from;
    if (to) params.to = to;

    api
      .get<PaginatedResponse<Invoice>>('/invoices', params, { skipCache: true })
      .then((data) => {
        setInvoices(data.data);
        setMeta(data.meta);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, status, from, to]);

  const isOverdue = (inv: Invoice) =>
    inv.status === 'sent' && new Date(inv.due_date) < new Date();

  return (
    <div>
      <PageHeader title="Invoices" subtitle={`${meta.total} invoices`} />

      <Card className="mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-40">
            <Select label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} options={statusOptions} />
          </div>
          <div className="w-40">
            <Input label="From" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
          </div>
          <div className="w-40">
            <Input label="To" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />
      ) : invoices.length === 0 ? (
        <Card padding="lg"><p className="text-center text-gray-500 py-8">No invoices found.</p></Card>
      ) : (
        <Card padding="sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow
                  key={inv.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`${basePath}/${inv.id}`)}
                >
                  <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                  <TableCell>{inv.customer?.name}</TableCell>
                  <TableCell className="text-gray-500">{inv.service_job?.reference_number}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[inv.status] ?? 'default'}>{inv.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">${parseFloat(inv.total).toFixed(2)}</TableCell>
                  <TableCell>{inv.issued_date}</TableCell>
                  <TableCell className={isOverdue(inv) ? 'text-red-600 font-medium' : ''}>
                    {inv.due_date}
                    {isOverdue(inv) && <span className="ml-1 text-xs">(overdue)</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {meta.last_page > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={meta.current_page}
                lastPage={meta.last_page}
                total={meta.total}
                onPageChange={setPage}
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
