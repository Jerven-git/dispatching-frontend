'use client';

import { use } from 'react';
import UserDetail from '@/components/users/UserDetail';

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <UserDetail userId={id} basePath="/admin/users" />;
}
