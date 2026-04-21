'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'error' | 'danger' | 'info' | 'default';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  status?: 'ACTIVE' | 'PAUSED' | 'ERROR' | 'PENDING';
  children: React.ReactNode;
}

export type { BadgeProps };

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, status, children, ...props }, ref) => {
    const styles: Record<BadgeVariant, string> = {
      success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      warning: 'bg-amber-50 text-amber-700 border-amber-200',
      error: 'bg-red-50 text-red-700 border-red-200',
      danger: 'bg-red-50 text-red-700 border-red-200',
      info: 'bg-accent-50 text-accent-700 border-accent-200',
      default: 'bg-gray-50 text-gray-600 border-gray-200',
    };

    const statusMap: Record<string, BadgeVariant> = {
      ACTIVE: 'success',
      PAUSED: 'warning',
      ERROR: 'danger',
      PENDING: 'info',
    };

    const resolved = status ? statusMap[status] || 'default' : (variant || 'default');

    const dotColors: Record<BadgeVariant, string> = {
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      error: 'bg-red-500',
      danger: 'bg-red-500',
      info: 'bg-accent-500',
      default: 'bg-gray-400',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
          styles[resolved],
          className
        )}
        {...props}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[resolved])} />
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
