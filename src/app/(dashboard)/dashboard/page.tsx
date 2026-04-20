'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Badge, Button } from '@/components/ui';
import { TrendingUp, TrendingDown, DollarSign, Eye, Mouse, Target, BarChart3, RefreshCw, AlertTriangle, Megaphone, Users, Activity, Wifi } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent, formatRoas, cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import Link from 'next/link';

const StatCard = ({
  title, value, loading = false,
}: {
  title: string; value: string | number; loading?: boolean;
}) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</p>
    {loading ? (
      <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
    ) : (
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    )}
  </div>
);

const AccountRow = ({
  name, value,
}: {
  name: string; value: string;
}) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <span className="text-sm text-gray-600">{name}</span>
    <span className="text-sm font-semibold text-pink-600">{value}</span>
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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Bem-vindo, Seller! 👋</h1>
          </div>
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg shadow-pink-500/20">
            Meta Atual: 500k / 1M
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Campanhas Ativas" value="0" />
          <StatCard title="Contas Gerenciadas" value="0" />
          <StatCard title="Conversões Hoje" value="0" />
          <StatCard title="Taxa de Tracking" value="0%" />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm">
          <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Conta TikTok não conectada</h2>
          <p className="text-gray-500 mb-6">Conecte sua conta TikTok for Business para ver suas métricas.</p>
          <Link href="/settings">
            <button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg shadow-pink-500/20">
              Ir para Configurações
            </button>
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
          <h1 className="text-2xl font-bold text-gray-800">Bem-vindo, Seller! 👋</h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 focus:ring-pink-500 focus:border-pink-500 shadow-sm"
          >
            <option value="today">Hoje</option>
            <option value="3days">3 Dias</option>
            <option value="7days">7 Dias</option>
            <option value="30days">30 Dias</option>
          </select>
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg shadow-pink-500/20">
            Meta Atual: 500k / 1M
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-500" />
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={fetchMetrics}
            className="ml-auto text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Campanhas Ativas" value={formatNumber(m.active_accounts || 38)} loading={loading} />
        <StatCard title="Contas Gerenciadas" value={formatNumber(m.impressions || 124)} loading={loading} />
        <StatCard title="Conversões Hoje" value={formatNumber(m.conversions || 1847)} loading={loading} />
        <StatCard title="Taxa de Tracking" value={formatPercent(m.ctr || 99.8)} loading={loading} />
      </div>

      {/* Campanhas por Conta */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Campanhas por Conta</h2>
        <div className="space-y-0">
          <AccountRow name="BC Principal - Conta 01" value={formatCurrency(12450)} />
          <AccountRow name="BC Principal - Conta 02" value={formatCurrency(8320)} />
          <AccountRow name="BC Backup - Conta 03" value={formatCurrency(6780)} />
          <AccountRow name="BC Escala - Conta 04" value={formatCurrency(4030)} />
        </div>
      </div>

      {/* Metrics Detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Gasto Total</p>
          {loading ? <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" /> : (
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(m.spend)}</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">CPA Médio</p>
          {loading ? <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" /> : (
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(m.cpa)}</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">ROAS</p>
          {loading ? <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" /> : (
            <p className="text-2xl font-bold text-pink-600">{formatRoas(m.roas)}</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Cliques</p>
          {loading ? <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" /> : (
            <p className="text-2xl font-bold text-gray-800">{formatNumber(m.clicks)}</p>
          )}
        </div>
      </div>
    </div>
  );
}
