'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

export type { ToggleProps };

const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, description, size = 'md', ...props }, ref) => {
    const sizeStyles = { sm: 'w-10 h-6', md: 'w-12 h-7', lg: 'w-14 h-8' };
    const sizeToggleStyles = { sm: 'translate-x-4', md: 'translate-x-5', lg: 'translate-x-6' };
    const sizeBallStyles = { sm: 'w-5 h-5', md: 'w-6 h-6', lg: 'w-7 h-7' };

    return (
      <div className={cn('flex items-center gap-3', className)}>
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input ref={ref} type="checkbox" className="sr-only peer" {...props} />
            <div
              className={cn(
                'bg-gray-200 border border-gray-300 rounded-full transition-colors duration-200',
                'peer-checked:bg-pink-500 peer-checked:border-pink-500',
                'peer-focus:ring-2 peer-focus:ring-pink-500 peer-focus:ring-offset-2 peer-focus:ring-offset-white',
                sizeStyles[size]
              )}
            />
            <div
              className={cn(
                'absolute top-1/2 left-0.5 transform -translate-y-1/2 rounded-full bg-white transition-transform duration-200 shadow-md',
                sizeBallStyles[size],
                `peer-checked:${sizeToggleStyles[size]}`
              )}
            />
          </div>
          {label && (
            <div>
              <p className="text-sm font-medium text-gray-700">{label}</p>
              {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
            </div>
          )}
        </label>
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle };
