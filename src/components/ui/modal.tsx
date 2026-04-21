'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

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
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={cn(
          'relative z-10 w-full rounded-xl bg-white border border-[#e8e8e6] shadow-xl',
          'max-h-[90vh] overflow-auto mx-4',
          sizeStyles[size],
          className
        )}
      >
        {(title || closeButton) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e8e6]">
            {title && <h2 className="text-[0.9375rem] font-semibold text-gray-900">{title}</h2>}
            {closeButton && (
              <button onClick={onClose} className="ml-auto p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
                <X size={16} />
              </button>
            )}
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
};

export { Modal };
