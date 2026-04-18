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

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  className,
  size = 'md',
}) => {
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
      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-dark-100 overflow-x-auto">
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
                ? 'border-brand-500 text-brand-400 bg-dark-400/50'
                : 'border-transparent text-gray-400 hover:text-gray-200',
              tab.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              'transition-all duration-200',
              activeTab === tab.id ? 'block opacity-100' : 'hidden opacity-0'
            )}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export { Tabs };
