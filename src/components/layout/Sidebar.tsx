'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/lib/roles';
import type { Role } from '@/types';

interface NavItem {
  name: string;
  href: string;
  roles: Role[];
}

const navigation: NavItem[] = [
  // Admin
  { name: 'Dashboard', href: '/admin', roles: ['admin'] },
  { name: 'Jobs', href: '/admin/jobs', roles: ['admin'] },
  { name: 'Customers', href: '/admin/customers', roles: ['admin'] },
  { name: 'Services', href: '/admin/services', roles: ['admin'] },
  { name: 'Users', href: '/admin/users', roles: ['admin'] },
  { name: 'Reports', href: '/admin/reports', roles: ['admin'] },
  // Dispatcher
  { name: 'Dashboard', href: '/dispatcher', roles: ['dispatcher'] },
  { name: 'Jobs', href: '/dispatcher/jobs', roles: ['dispatcher'] },
  { name: 'Customers', href: '/dispatcher/customers', roles: ['dispatcher'] },
  { name: 'Reports', href: '/dispatcher/reports', roles: ['dispatcher'] },
  // Technician
  { name: 'Dashboard', href: '/technician', roles: ['technician'] },
  { name: 'My Jobs', href: '/technician/my-jobs', roles: ['technician'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!user) return null;

  const filteredNav = navigation.filter((item) => item.roles.includes(user.role));

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between px-6">
        <h1 className="text-lg font-bold">Dispatch</h1>
        <button
          onClick={() => setOpen(false)}
          className="text-gray-400 hover:text-white md:hidden"
          aria-label="Close menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNav.map((item) => {
          const isDashboard = ['/admin', '/dispatcher', '/technician'].includes(item.href);
          const isActive = isDashboard
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <div className="mb-3">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-gray-400">{ROLE_LABELS[user.role]}</p>
        </div>
        <button
          onClick={logout}
          className="w-full rounded-md bg-gray-800 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-md bg-gray-900 p-2 text-white shadow-lg md:hidden"
        aria-label="Open menu"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile sidebar (slide-in) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900 text-white transition-transform duration-200 md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar (always visible) */}
      <aside className="hidden md:flex h-screen w-64 shrink-0 flex-col bg-gray-900 text-white">
        {sidebarContent}
      </aside>
    </>
  );
}
