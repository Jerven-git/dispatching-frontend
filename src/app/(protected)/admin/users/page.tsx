'use client';

import UserList from '@/components/users/UserList';

export default function AdminUsersPage() {
  return <UserList basePath="/admin/users" />;
}
