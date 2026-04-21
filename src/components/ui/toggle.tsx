'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export type { ToggleProps };

const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, description, ...props }, ref) => {
    return (
      <label className={cn('flex items-center gap-3 cursor-pointer', className)}>
        <div className="relative">
          <input ref={ref} type="checkbox" className="sr-only peer" {...props} />
          <div className="w-9 h-5 bg-gray-200 rounded-full transition-colors peer-checked:bg-accent-500 peer-focus-visible:ring-2 peer-focus-visible:ring-accent-500/20" />
          <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-xs transition-transform peer-checked:translate-x-4" />
        </div>
        {label && (
          <div>
            <p className="text-sm font-medium text-gray-700">{label}</p>
            {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
          </div>
        )}
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle };
