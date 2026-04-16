import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatRoas(value: number): string {
  return `${value.toFixed(2)}x`;
}

export function getDateRange(range: string): { start: string; end: string } {
  const end = new Date();
  const start = new Date();

  switch (range) {
    case 'today':
      break;
    case '3days':
      start.setDate(start.getDate() - 3);
      break;
    case '7days':
      start.setDate(start.getDate() - 7);
      break;
    case '30days':
      start.setDate(start.getDate() - 30);
      break;
    default:
      break;
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export function getTrendIcon(trend: 'UP' | 'DOWN' | 'STABLE'): string {
  switch (trend) {
    case 'UP': return '↑';
    case 'DOWN': return '↓';
    default: return '→';
  }
}

export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    ACTIVE: 'text-green-400',
    ENABLE: 'text-green-400',
    APPROVED: 'text-green-400',
    SUCCESS: 'text-green-400',
    PAUSED: 'text-yellow-400',
    DISABLE: 'text-yellow-400',
    PENDING: 'text-blue-400',
    PROCESSING: 'text-blue-400',
    REJECTED: 'text-red-400',
    FAILED: 'text-red-400',
    SUSPENDED: 'text-red-400',
    DISABLED: 'text-gray-400',
  };
  return statusMap[status] || 'text-gray-400';
}

export function getStatusLabel(status: string): string {
  const labelMap: Record<string, string> = {
    ACTIVE: 'Ativo',
    ENABLE: 'Ativo',
    PAUSED: 'Pausado',
    DISABLE: 'Pausado',
    PENDING: 'Pendente',
    PROCESSING: 'Processando',
    APPROVED: 'Aprovado',
    REJECTED: 'Reprovado',
    FAILED: 'Falhou',
    SUSPENDED: 'Suspensa',
    COMPLETED: 'Concluído',
    SUCCESS: 'Sucesso',
    DISABLED: 'Desativado',
    PARTIAL: 'Parcial',
  };
  return labelMap[status] || status;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
