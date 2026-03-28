'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import UserForm from '@/components/users/UserForm';
import type { User, UserFormData } from '@/types';

export default function AdminEditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api
      .get<{ user: User }>(`/users/${id}`)
      .then((data) => setUser(data.user))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: UserFormData) => {
    await api.put<{ user: User }>(`/users/${id}`, data);
    router.push(`/admin/users/${id}`);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-96 rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg bg-white p-12 text-center text-gray-500 shadow-sm">
        User not found.
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit User: {user.name}</h1>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <UserForm
          initialData={user}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/admin/users/${id}`)}
          submitLabel="Update User"
        />
      </div>
    </div>
  );
}
