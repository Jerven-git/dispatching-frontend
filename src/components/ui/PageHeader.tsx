import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backLink?: { href: string; label: string };
  actions?: React.ReactNode;
  className?: string;
}

function PageHeader({ title, subtitle, backLink, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {backLink && (
        <Link
          href={backLink.href}
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 mb-2"
        >
          &larr; {backLink.label}
        </Link>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}

PageHeader.displayName = 'PageHeader';

export { PageHeader };
export type { PageHeaderProps };
