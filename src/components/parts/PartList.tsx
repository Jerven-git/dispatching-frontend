'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Button, Card, Badge, PageHeader, Input, Select,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  Pagination,
} from '@/components/ui';
import type { Part, PaginatedResponse } from '@/types';

interface Props {
  basePath: string;
}

export default function PartList({ basePath }: Props) {
  const [parts, setParts] = useState<Part[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page) };
    if (search) params.search = search;
    if (activeFilter) params.is_active = activeFilter;

    api
      .get<PaginatedResponse<Part>>('/parts', params, { skipCache: true })
      .then((data) => { setParts(data.data); setMeta(data.meta); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, activeFilter]);

  return (
    <div>
      <PageHeader
        title="Parts Catalog"
        subtitle={`${meta.total} parts`}
        actions={
          <Link href={`${basePath}/create`}>
            <Button>Add Part</Button>
          </Link>
        }
      />

      <Card className="mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Search"
              placeholder="Name or SKU..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="w-40">
            <Select
              label="Status"
              value={activeFilter}
              onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
              options={[
                { value: '', label: 'All' },
                { value: '1', label: 'Active' },
                { value: '0', label: 'Inactive' },
              ]}
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />
      ) : parts.length === 0 ? (
        <Card padding="lg"><p className="text-center text-gray-500 py-8">No parts found.</p></Card>
      ) : (
        <Card padding="sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Min</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts.map((part) => (
                <TableRow
                  key={part.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`${basePath}/${part.id}`)}
                >
                  <TableCell className="font-medium">{part.name}</TableCell>
                  <TableCell className="text-gray-500 font-mono text-xs">{part.sku}</TableCell>
                  <TableCell className="text-right">${parseFloat(part.unit_price).toFixed(2)}</TableCell>
                  <TableCell className={`text-right font-medium ${part.is_low_stock ? 'text-red-600' : ''}`}>
                    {part.stock_quantity}
                    {part.is_low_stock && <span className="ml-1 text-xs">(low)</span>}
                  </TableCell>
                  <TableCell className="text-right text-gray-500">{part.minimum_stock}</TableCell>
                  <TableCell className="capitalize">{part.unit}</TableCell>
                  <TableCell>
                    <Badge variant={part.is_active ? 'success' : 'default'}>
                      {part.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {meta.last_page > 1 && (
            <div className="mt-4">
              <Pagination currentPage={meta.current_page} lastPage={meta.last_page} total={meta.total} onPageChange={setPage} />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
