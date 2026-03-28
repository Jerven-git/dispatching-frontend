'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import UserForm from '@/components/users/UserForm';
import type { UserFormData, User } from '@/types';

export default function AdminCreateUserPage() {
  const router = useRouter();

  const handleSubmit = async (data: UserFormData) => {
    await api.post<{ user: User }>('/users', data);
    router.push('/admin/users');
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Add User</h1>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <UserForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/admin/users')}
          submitLabel="Create User"
        />
      </div>
    </div>
  );
}
