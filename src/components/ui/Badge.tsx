import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  {
    variants: {
      variant: {
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        neutral: 'bg-gray-100 text-gray-800',
        primary: 'bg-primary-100 text-primary-800',
        accent: 'bg-accent-100 text-accent-800',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />;
  }
);

Badge.displayName = 'Badge';

/**
 * Helper function to get badge variant based on status string
 */
function getStatusBadgeVariant(
  status: string
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary' | 'accent' {
  const statusMap: Record<string, ReturnType<typeof getStatusBadgeVariant>> = {
    completed: 'success',
    finished: 'success',
    success: 'success',
    pending: 'warning',
    assigned: 'info',
    on_the_way: 'primary',
    in_progress: 'accent',
    'in-progress': 'accent',
    scheduled: 'info',
    cancelled: 'danger',
    failed: 'danger',
    error: 'danger',
  };

  return statusMap[status.toLowerCase()] || 'neutral';
}

/**
 * Helper function to get badge variant based on priority string
 */
function getPriorityBadgeVariant(
  priority: string
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary' | 'accent' {
  const priorityMap: Record<string, ReturnType<typeof getPriorityBadgeVariant>> = {
    low: 'success',
    medium: 'info',
    high: 'warning',
    urgent: 'danger',
  };

  return priorityMap[priority.toLowerCase()] || 'neutral';
}

export { Badge, badgeVariants, getStatusBadgeVariant, getPriorityBadgeVariant };
export type { BadgeProps };
