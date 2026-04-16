'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#13161b',
            color: '#e2e8f0',
            border: '1px solid #1e2128',
            borderRadius: '8px',
            padding: '16px',
          },
          success: {
            style: {
              background: '#13161b',
              borderColor: '#10b981',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#13161b',
            },
          },
          error: {
            style: {
              background: '#13161b',
              borderColor: '#ef4444',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#13161b',
            },
          },
          loading: {
            style: {
              background: '#13161b',
              borderColor: '#00e6a0',
            },
          },
        }}
      />
    </>
  );
}
