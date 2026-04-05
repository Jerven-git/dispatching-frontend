'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePortalAuth } from '@/contexts/PortalAuthContext';
import { Briefcase, FileText, PlusCircle, ClipboardList, Star, LogOut, X, Menu, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const navigation: NavItem[] = [
  { name: 'My Jobs', href: '/portal/jobs', icon: Briefcase },
  { name: 'My Invoices', href: '/portal/invoices', icon: FileText },
  { name: 'Request Service', href: '/portal/request-service', icon: PlusCircle },
  { name: 'My Requests', href: '/portal/requests', icon: ClipboardList },
  { name: 'My Reviews', href: '/portal/reviews', icon: Star },
];

export default function PortalNav() {
  const pathname = usePathname();
  const { customer, logout } = usePortalAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!customer) return null;

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100">
        <Link href="/portal/jobs" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-600">
            <Zap className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">My Portal</span>
        </Link>
        <button
          onClick={() => setOpen(false)}
          className="text-gray-400 hover:text-gray-600 md:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Customer info */}
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
        <p className="text-xs text-gray-500 truncate">{customer.email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-accent-50 text-accent-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-accent-600' : 'text-gray-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto border-t border-gray-100 p-3">
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
      {/* Mobile hamburger */}
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

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-xl transition-transform duration-200 md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-screen w-64 shrink-0 flex-col bg-white border-r border-gray-200">
        {sidebarContent}
      </aside>
    </>
  );
}
