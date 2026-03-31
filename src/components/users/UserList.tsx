'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ROLE_LABELS } from '@/lib/roles';
import { Input, Select, Button, Card, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Pagination, Badge, PageHeader } from '@/components/ui';
import type { User, PaginatedResponse, Role } from '@/types';

interface UserListProps {
  basePath: string;
}

const ROLE_BADGE_VARIANT: Record<string, 'primary' | 'info' | 'success'> = {
  admin: 'primary',
  dispatcher: 'info',
  technician: 'success',
};

export default function UserList({ basePath }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginatedResponse<User>['meta'] | null>(null);

  const fetchUsers = useCallback((searchTerm: string, role: string, pageNum: number) => {
    setLoading(true);
    const params: Record<string, string> = { page: String(pageNum) };
    if (searchTerm) params.search = searchTerm;
    if (role) params.role = role;

    api
      .get<PaginatedResponse<User>>('/users', params)
      .then((data) => {
        setUsers(data.data);
        setMeta(data.meta);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers(search, roleFilter, page);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, roleFilter, page, fetchUsers]);

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'dispatcher', label: 'Dispatcher' },
    { value: 'technician', label: 'Technician' },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        actions={
          <>
            <Select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              options={roles}
              placeholder="All Roles"
            />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-64"
            />
            <Link href={`${basePath}/create`}>
              <Button variant="primary">Add User</Button>
            </Link>
          </>
        }
      />

      {loading ? (
        <Card>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-gray-200 animate-pulse" />
            ))}
          </div>
        </Card>
      ) : users.length === 0 ? (
        <Card padding="lg">
          <p className="text-center text-gray-500">No users found.</p>
        </Card>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="whitespace-nowrap font-medium">
                    <Link href={`${basePath}/${user.id}`} className="text-indigo-600 hover:text-indigo-700">
                      {user.name}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-gray-700">
                    {user.email}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-gray-700">
                    {user.phone || '-'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant={ROLE_BADGE_VARIANT[user.role] || 'neutral'}>
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant={user.is_active ? 'success' : 'danger'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <Link
                      href={`${basePath}/${user.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
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
              className="mt-4"
            />
          )}
        </>
      )}
    </div>
  );
}
