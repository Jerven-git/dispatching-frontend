'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ROLE_LABELS } from '@/lib/roles';
import type { User } from '@/types';

interface UserDetailProps {
  userId: string;
  basePath: string;
}

export default function UserDetail({ userId, basePath }: UserDetailProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    api
      .get<{ user: User }>(`/users/${userId}`)
      .then((data) => setUser(data.user))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user? This action can be undone.')) return;

    setDeleting(true);
    try {
      await api.delete(`/users/${userId}`);
      router.push(basePath);
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-64 rounded-lg bg-gray-200" />
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href={basePath} className="text-sm text-blue-600 hover:text-blue-800">
            &larr; Back to Users
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{user.name}</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href={`${basePath}/${user.id}/edit`}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Phone</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.phone || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Role</dt>
            <dd className="mt-1">
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                user.role === 'admin'
                  ? 'bg-purple-100 text-purple-800'
                  : user.role === 'dispatcher'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
              }`}>
                {ROLE_LABELS[user.role]}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                user.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(user.created_at).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
