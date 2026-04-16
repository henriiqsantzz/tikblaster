'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'error' | 'danger' | 'info' | 'default';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  status?: 'ACTIVE' | 'PAUSED' | 'ERROR' | 'PENDING';
  children: React.ReactNode;
}

export type { BadgeProps };

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, status, children, ...props }, ref) => {
    const variantStyles: Record<BadgeVariant, string> = {
      success: 'bg-green-500/20 text-green-400 border border-green-500/30',
      warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      error: 'bg-red-500/20 text-red-400 border border-red-500/30',
      danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
      info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      default: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    };

    const statusStyles = {
      ACTIVE: 'bg-green-500/20 text-green-400 border border-green-500/30',
      PAUSED: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      ERROR: 'bg-red-500/20 text-red-400 border border-red-500/30',
      PENDING: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    };

    const dotColor: Record<BadgeVariant, string> = {
      success: 'bg-green-400',
      warning: 'bg-yellow-400',
      error: 'bg-red-400',
      danger: 'bg-red-400',
      info: 'bg-blue-400',
      default: 'bg-gray-400',
    };

    const selectedStyle = status ? statusStyles[status] : variantStyles[variant || 'default'];
    const selectedDot =
      status ?
      (status === 'ACTIVE' ? 'bg-green-400' : status === 'PAUSED' ? 'bg-yellow-400' : status === 'ERROR' ? 'bg-red-400' : 'bg-blue-400')
      : dotColor[variant || 'default'];

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
          selectedStyle,
          className
        )}
        {...props}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full', selectedDot)} />
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
