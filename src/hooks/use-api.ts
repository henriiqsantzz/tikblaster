'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useApi<T = any>(options?: UseApiOptions) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (url: string, fetchOptions?: RequestInit): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          headers: { 'Content-Type': 'application/json' },
          ...fetchOptions,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || `Error ${response.status}`);
        }

        setData(result);
        options?.onSuccess?.(result);
        if (options?.successMessage) {
          toast.success(options.successMessage);
        }
        return result;
      } catch (err: any) {
        const errorMsg = err.message || 'Erro desconhecido';
        setError(errorMsg);
        options?.onError?.(errorMsg);
        toast.error(options?.errorMessage || errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  return { data, error, isLoading, execute };
}

// Polling hook for real-time updates
export function usePolling(
  callback: () => Promise<void>,
  intervalMs: number = 30000,
  enabled: boolean = true
) {
  const [isPolling, setIsPolling] = useState(false);

  const startPolling = useCallback(() => {
    if (!enabled || isPolling) return;

    setIsPolling(true);
    const interval = setInterval(async () => {
      try {
        await callback();
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, intervalMs);

    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [callback, intervalMs, enabled, isPolling]);

  return { startPolling, isPolling };
}
