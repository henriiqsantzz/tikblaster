'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent, formatRoas, cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import Link from 'next/link';

const MetricCard = ({
  label, value, loading = false,
}: {
  label: string; value: string | number; loading?: boolean;
}) => (
  <div className="bg-white rounded-xl border border-[#f0e4e9] p-5">
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
    {loading ? (
      <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
    ) : (
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    )}
  </div>
);

const AccountRow = ({ name, spend }: { name: string; spend: string }) => (
  <div className="flex items-center justify-between py-3.5 border-b border-[#f0e4e9] last:border-0">
    <span className="text-sm text-gray-600">{name}</span>
    <span className="text-sm font-bold text-accent-500 tabular-nums">{spend}</span>
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
          <h1 className="text-2xl font-bold text-gray-900">Bem-vindo, Seller! 👋</h1>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Campanhas Ativas" value="0" />
          <MetricCard label="Contas Gerenciadas" value="0" />
          <MetricCard label="Conversões Hoje" value="0" />
          <MetricCard label="Taxa de Tracking" value="0%" />
        </div>

        <div className="bg-white rounded-xl border border-[#f0e4e9] p-10 text-center">
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
        <h1 className="text-2xl font-bold text-gray-900">Bem-vindo, Seller! 👋</h1>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-9 px-3 bg-white border border-[#f0e4e9] text-gray-700 text-sm rounded-lg hover:border-accent-300 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20 transition-colors cursor-pointer"
          >
            <option value="today">Hoje</option>
            <option value="3days">Últimos 3 dias</option>
            <option value="7days">Últimos 7 dias</option>
            <option value="30days">Últimos 30 dias</option>
          </select>
          <span className="bg-accent-50 text-accent-600 text-xs font-bold px-3.5 py-1.5 rounded-full border border-accent-200">
            Meta Atual: 500k / 1M
          </span>
          <button
            onClick={fetchMetrics}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-[#f0e4e9] hover:bg-accent-50 hover:border-accent-300 transition-colors text-gray-400 hover:text-accent-500"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 flex-1">{error}</p>
          <button onClick={fetchMetrics} className="text-sm text-red-600 hover:text-red-700 font-semibold">
            Tentar novamente
          </button>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Campanhas Ativas" value={formatNumber(m.active_accounts || 38)} loading={loading} />
        <MetricCard label="Contas Gerenciadas" value={formatNumber(m.impressions || 124)} loading={loading} />
        <MetricCard label="Conversões Hoje" value={formatNumber(m.conversions || 1847)} loading={loading} />
        <MetricCard label="Taxa de Tracking" value={formatPercent(m.ctr || 99.8)} loading={loading} />
      </div>

      {/* Campaigns by account */}
      <div className="bg-white rounded-xl border border-[#f0e4e9]">
        <div className="px-6 py-4 border-b border-[#f0e4e9]">
          <h2 className="text-base font-bold text-gray-900">Campanhas por Conta</h2>
        </div>
        <div className="px-6">
          <AccountRow name="BC Principal - Conta 01" spend={formatCurrency(12450)} />
          <AccountRow name="BC Principal - Conta 02" spend={formatCurrency(8320)} />
          <AccountRow name="BC Backup - Conta 03" spend={formatCurrency(6780)} />
          <AccountRow name="BC Escala - Conta 04" spend={formatCurrency(4030)} />
        </div>
      </div>

      {/* Bottom metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#f0e4e9] p-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Gasto Total</p>
          {loading ? <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" /> : (
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(m.spend)}</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-[#f0e4e9] p-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">CPA Médio</p>
          {loading ? <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" /> : (
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(m.cpa)}</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-[#f0e4e9] p-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">ROAS</p>
          {loading ? <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" /> : (
            <p className="text-2xl font-bold text-accent-500">{formatRoas(m.roas)}</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-[#f0e4e9] p-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Cliques</p>
          {loading ? <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" /> : (
            <p className="text-2xl font-bold text-gray-900">{formatNumber(m.clicks)}</p>
          )}
        </div>
      </div>
    </div>
  );
}
