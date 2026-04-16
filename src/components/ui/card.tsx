'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export type { CardProps };

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, subtitle, icon, actions, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg bg-dark-300 border border-dark-100 backdrop-blur-md backdrop-saturate-150 shadow-lg',
          className
        )}
        {...props}
      >
        {(title || subtitle || icon || actions) && (
          <div className="px-6 py-4 border-b border-dark-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && <div className="text-brand-500 flex-shrink-0">{icon}</div>}
              <div>
                {title && <h3 className="text-lg font-semibold text-gray-50">{title}</h3>}
                {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
              </div>
            </div>
            {actions && <div className="flex-shrink-0">{actions}</div>}
          </div>
        )}
        <div className="px-6 py-4">{children}</div>
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
