import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Table component - main container
 */
const Table = React.forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
      <table ref={ref} className={cn('w-full text-sm', className)} {...props} />
    </div>
  )
);
Table.displayName = 'Table';

/**
 * TableHeader component - thead wrapper
 */
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('bg-gray-50 border-b border-gray-200', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

/**
 * TableBody component - tbody wrapper
 */
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('divide-y divide-gray-200 bg-white', className)} {...props} />
));
TableBody.displayName = 'TableBody';

/**
 * TableRow component - tr with hover effect
 */
const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'transition-colors duration-150',
        'hover:bg-gray-50',
        'data-[state=selected]:bg-blue-50',
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

/**
 * TableHead component - th for header cells
 */
const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide',
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = 'TableHead';

/**
 * TableCell component - td for data cells
 */
const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn('px-4 py-3 text-gray-900', className)} {...props} />
  )
);
TableCell.displayName = 'TableCell';

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell };
