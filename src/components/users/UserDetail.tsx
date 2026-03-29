'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ROLE_LABELS } from '@/lib/roles';
import { Button, Card, Badge, PageHeader } from '@/components/ui';
import type { User } from '@/types';

interface UserDetailProps {
  userId: string;
  basePath: string;
}

const ROLE_BADGE_VARIANT: Record<string, 'primary' | 'info' | 'success'> = {
  admin: 'primary',
  dispatcher: 'info',
  technician: 'success',
};

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
      <Card padding="lg">
        <p className="text-center text-gray-500">User not found.</p>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title={user.name}
        backLink={{ href: basePath, label: 'Back to Users' }}
        actions={
          <>
            <Link href={`${basePath}/${user.id}/edit`}>
              <Button variant="primary" size="sm">Edit</Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={handleDelete} loading={deleting}>
              Delete
            </Button>
          </>
        }
      />

      <Card>
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
              <Badge variant={ROLE_BADGE_VARIANT[user.role] || 'neutral'}>
                {ROLE_LABELS[user.role]}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={user.is_active ? 'success' : 'danger'}>
                {user.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(user.created_at).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
