'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export type { Tab, TabsProps };

const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, onChange, className, size = 'md' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeSizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
  };

  return (
    <div className={className}>
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              'flex items-center gap-2 font-medium transition-all duration-200 whitespace-nowrap',
              activeSizeStyles[size],
              'border-b-2 rounded-t-lg',
              activeTab === tab.id
                ? 'border-pink-500 text-pink-600 bg-pink-50'
                : 'border-transparent text-gray-500 hover:text-gray-700',
              tab.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn('transition-all duration-200', activeTab === tab.id ? 'block opacity-100' : 'hidden opacity-0')}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export { Tabs };
