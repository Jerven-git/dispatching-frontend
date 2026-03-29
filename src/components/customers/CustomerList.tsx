'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Input, Button, Card, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Pagination } from '@/components/ui';
import type { Customer, PaginatedResponse } from '@/types';

interface CustomerListProps {
  basePath: string; // e.g. '/admin/customers' or '/dispatcher/customers'
}

export default function CustomerList({ basePath }: CustomerListProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginatedResponse<Customer>['meta'] | null>(null);

  const fetchCustomers = useCallback((searchTerm: string, pageNum: number) => {
    setLoading(true);
    const params: Record<string, string> = { page: String(pageNum) };
    if (searchTerm) params.search = searchTerm;

    api
      .get<PaginatedResponse<Customer>>('/customers', params)
      .then((data) => {
        setCustomers(data.data);
        setMeta(data.meta);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchCustomers(search, 1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, fetchCustomers]);

  useEffect(() => {
    if (page > 1) fetchCustomers(search, page);
  }, [page, search, fetchCustomers]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your customer database</p>
        </div>
        <Link
          href={`${basePath}/create`}
          className="inline-block"
        >
          <Button variant="primary">
            + Add Customer
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="w-full sm:w-80">
        <Input
          type="text"
          placeholder="Search by name, phone, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
      </div>

      {/* Table or Loading State */}
      {loading ? (
        <Card>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 rounded bg-gray-200 animate-pulse" />
            ))}
          </div>
        </Card>
      ) : customers.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No customers found.</p>
          </div>
        </Card>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>City</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Link href={`${basePath}/${customer.id}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
                      {customer.name}
                    </Link>
                  </TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                  <TableCell>{customer.city || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`${basePath}/${customer.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {meta && meta.last_page > 1 && (
            <Pagination
              currentPage={meta.current_page}
              totalPages={meta.last_page}
              totalItems={meta.total}
              itemsPerPage={meta.per_page}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
