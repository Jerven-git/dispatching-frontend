import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', ...props }, ref) => {
    const paddingClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const variantClasses = {
      default: 'bg-white border border-gray-100 rounded-xl shadow-sm',
      interactive:
        'bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer',
      elevated: 'bg-white rounded-xl shadow-md',
    };

    return (
      <div
        ref={ref}
        className={cn(variantClasses[variant], paddingClasses[padding], className)}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export { Card };
export type { CardProps };
