'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export type { LoadingSpinnerProps };

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className,
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)} {...props}>
      <svg
        className={cn('animate-spin', sizeStyles[size])}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75 text-brand-500"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && <p className="text-gray-400 text-sm">{text}</p>}
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

const Skeleton: React.FC<SkeletonProps> = ({
  count = 1,
  circle = false,
  height = 'h-4',
  width = 'w-full',
  className,
  ...props
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-gradient-to-r from-dark-300 via-dark-200 to-dark-300 animate-pulse',
            circle ? 'rounded-full' : 'rounded-lg',
            height,
            width,
            i < count - 1 && 'mb-3',
            className
          )}
          {...props}
        />
      ))}
    </>
  );
};

interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
}

export type { SkeletonCardProps };

const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 3, className, ...props }) => {
  return (
    <div
      className={cn(
        'rounded-lg bg-dark-300 border border-dark-100 p-6 space-y-4',
        className
      )}
      {...props}
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton height="h-6" width="w-48" />
        <Skeleton height="h-6" width="w-12" circle />
      </div>

      {/* Content skeleton */}
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} height="h-4" />
        ))}
      </div>

      {/* Footer skeleton */}
      <div className="pt-4 border-t border-dark-100 flex gap-2">
        <Skeleton height="h-8" width="w-20" />
        <Skeleton height="h-8" width="w-20" />
      </div>
    </div>
  );
};

interface PageLoaderProps {
  fullPage?: boolean;
  text?: string;
}

export type { PageLoaderProps };

const PageLoader: React.FC<PageLoaderProps> = ({ fullPage = true, text = 'Loading...' }) => {
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-500/80 backdrop-blur-sm">
        <LoadingSpinner size="lg" text={text} />
      </div>
    );
  }

  return <LoadingSpinner size="lg" text={text} />;
};

export { LoadingSpinner, Skeleton, SkeletonCard, PageLoader };
