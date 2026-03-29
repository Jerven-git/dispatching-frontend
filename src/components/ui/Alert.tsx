import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva('rounded-lg border p-4 text-sm', {
  variants: {
    variant: {
      error: 'border-red-300 bg-red-50 text-red-800',
      success: 'border-green-300 bg-green-50 text-green-800',
      warning: 'border-yellow-300 bg-yellow-50 text-yellow-800',
      info: 'border-blue-300 bg-blue-50 text-blue-800',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title?: string;
  onDismiss?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, title, onDismiss, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(alertVariants({ variant }), className)} {...props}>
        <div className="flex items-start justify-between">
          <div>
            {title && <p className="font-medium mb-1">{title}</p>}
            {children && <p>{children}</p>}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="ml-4 text-current hover:opacity-70 transition-opacity"
              aria-label="Dismiss alert"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export { Alert, alertVariants };
export type { AlertProps };
