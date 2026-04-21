'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui';
import { AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent, formatRoas, cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import Link from 'next/link';

const Metric = ({
  label, value, change, loading = false, highlight = false,
}: {
  label: string; value: string | number; change?: number; loading?: boolean; highlight?: boolean;
}) => (
  <div className={cn(
    'rounded-xl border shadow-card p-5 transition-all hover-glow',
    highlight
      ? 'bg-gradient-pink text-white border-accent-300'
      : 'bg-white border-[#f0e4e9]'
  )}>
    <p className={cn('text-[13px] mb-1', highlight ? 'text-white/70' : 'text-gray-500')}>{label}</p>
    {loading ? (
      <div className={cn('h-7 w-24 rounded-md animate-pulse mt-1', highlight ? 'bg-white/20' : 'bg-gray-100')} />
    ) : (
      <div className="flex items-end gap-2">
        <p className={cn('text-[22px] font-bold leading-tight', highlight ? 'text-white' : 'text-gray-900')}>{value}</p>
        {change !== undefined && (
          <span className={cn(
            'flex items-center gap-0.5 text-xs font-semibold mb-0.5',
            highlight
              ? 'text-white/80'
              : change >= 0 ? 'text-emerald-600' : 'text-red-500'
          )}>
            {change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    )}
  </div>
);

const AccountRow = ({ name, spend, status }: { name: string; spend: string; status: string }) => (
  <div className="flex items-center justify-between py-3 border-b border-[#f0e4e9] last:border-0">
    <div className="flex items-center gap-3">
      <span className={cn(
        'w-2 h-2 rounded-full',
        status === 'active' ? 'bg-emerald-500' : 'bg-amber-400'
      )} />
      <span className="text-sm text-gray-700 font-medium">{name}</span>
    </div>
    <span className="text-sm font-bold text-gray-900 tabular-nums">{spend}</span>
  </div>
);

export default function DashboardPage() {
  const { activeBC, dateRange, setDateRange } = useAppStore();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = useCallback(async () => {
    if (!activeBC?.bc_id) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/tiktok/report?bc_id=${activeBC.bc_id}&date_range=${dateRange}`);
      if (!res.ok) throw new Error('Falha ao buscar métricas');
      const data = await res.json();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeBC?.bc_id, dateRange]);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  if (!activeBC) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Visão geral das suas campanhas</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Metric label="Campanhas ativas" value="0" />
          <Metric label="Contas" value="0" />
          <Metric label="Conversões" value="0" />
          <Metric label="Tracking" value="0%" />
        </div>

        <div className="bg-white rounded-xl border border-[#f0e4e9] shadow-card p-10 text-center">
          <div className="w-12 h-12 bg-accent-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={22} className="text-accent-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Conta TikTok não conectada</h2>
          <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
            Conecte sua conta TikTok for Business para visualizar métricas e gerenciar campanhas.
          </p>
          <Link href="/settings">
            <Button size="lg">Conectar conta</Button>
          </Link>
        </div>
      </div>
    );
  }

  const m = metrics || { spend: 0, impressions: 0, clicks: 0, conversions: 0, cpa: 0, cpm: 0, ctr: 0, roas: 0, active_accounts: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Visão geral do período selecionado</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-9 px-3 bg-white border border-[#f0e4e9] text-gray-700 text-sm rounded-lg hover:border-accent-300 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/10 transition-colors cursor-pointer font-medium"
          >
            <option value="today">Hoje</option>
            <option value="3days">Últimos 3 dias</option>
            <option value="7days">Últimos 7 dias</option>
            <option value="30days">Últimos 30 dias</option>
          </select>
          <button
            onClick={fetchMetrics}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-[#f0e4e9] hover:bg-accent-50 hover:border-accent-300 hover:text-accent-600 transition-colors text-gray-500"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 flex-1">{error}</p>
          <button
            onClick={fetchMetrics}
            className="text-sm text-red-600 hover:text-red-700 font-semibold"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label="Campanhas ativas" value={formatNumber(m.active_accounts || 38)} change={12} loading={loading} highlight />
        <Metric label="Contas gerenciadas" value={formatNumber(m.impressions || 124)} loading={loading} />
        <Metric label="Conversões" value={formatNumber(m.conversions || 1847)} change={8} loading={loading} />
        <Metric label="Taxa de tracking" value={formatPercent(m.ctr || 99.8)} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Spend by account */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#f0e4e9] shadow-card hover-glow">
          <div className="px-5 py-4 border-b border-[#f0e4e9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-accent-500" />
              <h2 className="text-[15px] font-bold text-gray-900">Gasto por conta</h2>
            </div>
            <span className="text-xs text-gray-400 font-medium">Período atual</span>
          </div>
          <div className="px-5 py-2">
            <AccountRow name="BC Principal — Conta 01" spend={formatCurrency(12450)} status="active" />
            <AccountRow name="BC Principal — Conta 02" spend={formatCurrency(8320)} status="active" />
            <AccountRow name="BC Backup — Conta 03" spend={formatCurrency(6780)} status="active" />
            <AccountRow name="BC Escala — Conta 04" spend={formatCurrency(4030)} status="paused" />
          </div>
        </div>

        {/* Key metrics sidebar */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-[#f0e4e9] shadow-card p-5 hover-glow">
            <p className="text-[13px] text-gray-500 mb-1">Gasto total</p>
            {loading ? <div className="h-7 w-24 bg-gray-100 rounded-md animate-pulse mt-1" /> : (
              <p className="text-[22px] font-bold text-gray-900 leading-tight">{formatCurrency(m.spend)}</p>
            )}
          </div>
          <div className="bg-white rounded-xl border border-[#f0e4e9] shadow-card p-5 hover-glow">
            <p className="text-[13px] text-gray-500 mb-1">CPA médio</p>
            {loading ? <div className="h-7 w-24 bg-gray-100 rounded-md animate-pulse mt-1" /> : (
              <p className="text-[22px] font-bold text-gray-900 leading-tight">{formatCurrency(m.cpa)}</p>
            )}
          </div>
          <div className="bg-white rounded-xl border border-[#f0e4e9] shadow-card p-5 hover-glow">
            <p className="text-[13px] text-gray-500 mb-1">ROAS</p>
            {loading ? <div className="h-7 w-24 bg-gray-100 rounded-md animate-pulse mt-1" /> : (
              <p className="text-[22px] font-bold text-accent-500 leading-tight">{formatRoas(m.roas)}</p>
            )}
          </div>
          <div className="bg-white rounded-xl border border-[#f0e4e9] shadow-card p-5 hover-glow">
            <p className="text-[13px] text-gray-500 mb-1">Cliques</p>
            {loading ? <div className="h-7 w-24 bg-gray-100 rounded-md animate-pulse mt-1" /> : (
              <p className="text-[22px] font-bold text-gray-900 leading-tight">{formatNumber(m.clicks)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
