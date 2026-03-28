'use client';

import RoleGuard from '@/components/auth/RoleGuard';

export default function DispatcherLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['dispatcher']}>{children}</RoleGuard>;
}
