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
          'rounded-xl bg-white border border-[#f0e4e9] shadow-card hover-glow',
          className
        )}
        {...props}
      >
        {(title || subtitle || icon || actions) && (
          <div className="px-5 py-4 border-b border-[#f0e4e9] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {icon && <div className="text-accent-400">{icon}</div>}
              <div>
                {title && <h3 className="text-[0.9375rem] font-semibold text-gray-900">{title}</h3>}
                {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
              </div>
            </div>
            {actions && <div className="flex-shrink-0">{actions}</div>}
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
