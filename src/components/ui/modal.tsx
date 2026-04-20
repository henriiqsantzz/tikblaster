'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  closeButton?: boolean;
}

export type { ModalProps };

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className, size = 'md', closeButton = true }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div
        className={cn(
          'relative z-10 w-full rounded-xl bg-white border border-gray-200 shadow-2xl',
          'max-h-[90vh] overflow-auto',
          sizeStyles[size],
          'mx-4 animation-in fade-in slide-in-from-bottom-4 duration-200',
          className
        )}
      >
        {(title || closeButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            {title && <h2 className="text-xl font-semibold text-gray-800">{title}</h2>}
            {closeButton && (
              <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
};

export { Modal };
