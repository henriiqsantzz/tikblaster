'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export type { LoadingSpinnerProps };

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text, className, ...props }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)} {...props}>
      <svg className={cn('animate-spin text-accent-500', sizes[size])} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
};

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  circle?: boolean;
  height?: string;
  width?: string;
}

export type { SkeletonProps };

const Skeleton: React.FC<SkeletonProps> = ({ count = 1, circle = false, height = 'h-4', width = 'w-full', className, ...props }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={cn(
          'bg-gray-100 animate-pulse',
          circle ? 'rounded-full' : 'rounded-md',
          height, width,
          i < count - 1 && 'mb-2',
          className
        )}
        {...props}
      />
    ))}
  </>
);

interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
}

export type { SkeletonCardProps };

const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 3, className, ...props }) => (
  <div className={cn('rounded-xl bg-white border border-[#e8e8e6] p-5 space-y-3', className)} {...props}>
    <div className="flex items-center justify-between mb-3">
      <Skeleton height="h-5" width="w-40" />
      <Skeleton height="h-5" width="w-10" circle />
    </div>
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height="h-3.5" />
      ))}
    </div>
  </div>
);

interface PageLoaderProps {
  fullPage?: boolean;
  text?: string;
}

export type { PageLoaderProps };

const PageLoader: React.FC<PageLoaderProps> = ({ fullPage = true, text = 'Carregando...' }) => {
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
        <LoadingSpinner size="lg" text={text} />
      </div>
    );
  }
  return <LoadingSpinner size="lg" text={text} />;
};

export { LoadingSpinner, Skeleton, SkeletonCard, PageLoader };
