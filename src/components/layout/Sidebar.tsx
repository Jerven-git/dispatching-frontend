'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/lib/roles';
import { LayoutDashboard, Briefcase, Users, Wrench, ClipboardList, BarChart3, CalendarDays, Zap, Settings, LogOut, X, Menu } from 'lucide-react';
import NotificationBell from './NotificationBell';
import type { Role } from '@/types';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  roles: Role[];
  icon: LucideIcon;
}

const navigation: NavItem[] = [
  // Admin
  { name: 'Dashboard', href: '/admin', roles: ['admin'], icon: LayoutDashboard },
  { name: 'Jobs', href: '/admin/jobs', roles: ['admin'], icon: Briefcase },
  { name: 'Customers', href: '/admin/customers', roles: ['admin'], icon: Users },
  { name: 'Services', href: '/admin/services', roles: ['admin'], icon: Wrench },
  { name: 'Users', href: '/admin/users', roles: ['admin'], icon: ClipboardList },
  { name: 'Calendar', href: '/admin/calendar', roles: ['admin'], icon: CalendarDays },
  { name: 'Reports', href: '/admin/reports', roles: ['admin'], icon: BarChart3 },
  // Dispatcher
  { name: 'Dashboard', href: '/dispatcher', roles: ['dispatcher'], icon: LayoutDashboard },
  { name: 'Jobs', href: '/dispatcher/jobs', roles: ['dispatcher'], icon: Briefcase },
  { name: 'Customers', href: '/dispatcher/customers', roles: ['dispatcher'], icon: Users },
  { name: 'Calendar', href: '/dispatcher/calendar', roles: ['dispatcher'], icon: CalendarDays },
  { name: 'Reports', href: '/dispatcher/reports', roles: ['dispatcher'], icon: BarChart3 },
  // Technician
  { name: 'Dashboard', href: '/technician', roles: ['technician'], icon: LayoutDashboard },
  { name: 'My Jobs', href: '/technician/my-jobs', roles: ['technician'], icon: Briefcase },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!user) return null;

  const filteredNav = navigation.filter((item) => item.roles.includes(user.role));

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Zap className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">Dispatch</span>
        </Link>
        <button
          onClick={() => setOpen(false)}
          className="text-gray-400 hover:text-gray-600 md:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isDashboard = ['/admin', '/dispatcher', '/technician'].includes(item.href);
          const isActive = isDashboard
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto border-t border-gray-100 p-3 space-y-1">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-medium text-gray-400 uppercase">Notifications</span>
          <NotificationBell />
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="h-4.5 w-4.5 text-gray-400" />
          <span>Log out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-white p-2 text-gray-600 shadow-md border border-gray-200 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile sidebar (slide-in) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-xl transition-transform duration-200 md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar (always visible) */}
      <aside className="hidden md:flex h-screen w-64 shrink-0 flex-col bg-white border-r border-gray-200">
        {sidebarContent}
      </aside>
    </>
  );
}
