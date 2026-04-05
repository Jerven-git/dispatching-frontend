'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePortalAuth } from '@/contexts/PortalAuthContext';
import PortalNav from '@/components/portal/PortalNav';

export default function PortalProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { customer, loading } = usePortalAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !customer) {
      router.replace('/portal/login');
    }
  }, [customer, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-600 border-t-transparent" />
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="flex h-screen">
      <PortalNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 pt-16 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
