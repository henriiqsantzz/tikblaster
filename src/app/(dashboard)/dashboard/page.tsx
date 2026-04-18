'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Badge, Button, Select } from '@/components/ui';
import { TrendingUp, TrendingDown, DollarSign, Eye, Mouse, Target, BarChart3, RefreshCw, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent, formatRoas, cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import Link from 'next/link';

const AnalyticsCard = ({
  title, value, trend, icon: Icon, suffix = '', loading = false,
}: {
  title: string; value: string | number; trend?: 'UP' | 'DOWN' | 'STABLE';
  icon: React.ReactNode; suffix?: string; loading?: boolean;
}) => {
  const getTrendColor = (t?: string) => {
    switch (t) { case 'UP': return 'text-green-400'; case 'DOWN': return 'text-red-400'; default: return 'text-gray-400'; }
  };
  const getTrendIcon = (t?: string) => {
    switch (t) { case 'UP': return <TrendingUp size={16} />; case 'DOWN': return <TrendingDown size={16} />; default: return null; }
  };

  return (
    <Card className="flex items-start justify-between p-6">
      <div className="flex-1">
        <p className="text-sm text-gray-400 mb-2">{title}</p>
        {loading ? (
          <div className="h-8 w-24 bg-dark-200 rounded animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-gray-100">
            {value}{suffix && <span className="text-lg text-gray-400 ml-1">{suffix}</span>}
          </p>
        )}
        {trend && !loading && (
          <div className={cn('flex items-center gap-1 mt-3 text-sm font-medium', getTrendColor(trend))}>
            {getTrendIcon(trend)}
            {trend === 'UP' && 'Crescimento'}{trend === 'DOWN' && 'Redução'}{trend === 'STABLE' && 'Estável'}
          </div>
        )}
      </div>
      <div className="text-brand-500 flex-shrink-0">{Icon}</div>
    </Card>
  );
};

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
        <div>
          <h1 className="text-3xl font-bold text-gray-50">Dashboard</h1>
          <p className="text-gray-400 mt-1">Acompanhe o desempenho das suas campanhas</p>
        </div>
        <Card className="text-center py-16">
          <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-400" />
          <h2 className="text-xl font-bold text-gray-100 mb-2">Conta TikTok não conectada</h2>
          <p className="text-gray-400 mb-6">Conecte sua conta TikTok for Business para ver suas métricas.</p>
          <Link href="/settings">
            <Button size="lg">Ir para Configurações</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const m = metrics || { spend: 0, impressions: 0, clicks: 0, conversions: 0, cpa: 0, cpm: 0, ctr: 0, roas: 0, active_accounts: 0 };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-50">Dashboard</h1>
          <p className="text-gray-400 mt-1">BC: {activeBC.name || activeBC.bc_id}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-dark-300 border border-dark-100 text-gray-200 text-sm rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="today">Hoje</option>
            <option value="3days">3 Dias</option>
            <option value="7days">7 Dias</option>
            <option value="30days">30 Dias</option>
          </select>
          <Button variant="secondary" size="sm" onClick={fetchMetrics} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-900/50 bg-red-900/10">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
            <Button variant="secondary" size="sm" onClick={fetchMetrics}>Tentar novamente</Button>
          </div>
        </Card>
      )}

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard title="Gasto em Anúncios" value={formatCurrency(m.spend)} icon={<DollarSign size={28} />} loading={loading} trend={m.spend_trend} />
        <AnalyticsCard title="CPA" value={formatCurrency(m.cpa)} icon={<Target size={28} />} loading={loading} />
        <AnalyticsCard title="CPM" value={formatCurrency(m.cpm)} icon={<Eye size={28} />} loading={loading} />
        <AnalyticsCard title="CTR" value={formatPercent(m.ctr)} icon={<Mouse size={28} />} loading={loading} />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center justify-between p-6 lg:col-span-2">
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-2">ROAS</p>
            {loading ? (
              <div className="h-9 w-20 bg-dark-200 rounded animate-pulse" />
            ) : (
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-brand-500">{formatRoas(m.roas)}</p>
                {m.roas >= 1.5 && <Badge variant="success" className="text-sm">Positivo</Badge>}
                {m.roas > 0 && m.roas < 1 && <Badge variant="danger" className="text-sm">Negativo</Badge>}
              </div>
            )}
          </div>
          <div className="text-brand-500 flex-shrink-0"><TrendingUp size={32} /></div>
        </Card>
        <AnalyticsCard title="Contas Ativas" value={m.active_accounts} icon={<BarChart3 size={28} />} loading={loading} />
        <AnalyticsCard title="Conversões" value={formatNumber(m.conversions)} icon={<Target size={28} />} loading={loading} />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-6">
          <p className="text-gray-400 text-sm mb-2">Impressões</p>
          {loading ? <div className="h-8 w-20 mx-auto bg-dark-200 rounded animate-pulse" /> : (
            <p className="text-2xl font-bold text-gray-100">{formatNumber(m.impressions)}</p>
          )}
        </Card>
        <Card className="text-center p-6">
          <p className="text-gray-400 text-sm mb-2">Cliques</p>
          {loading ? <div className="h-8 w-20 mx-auto bg-dark-200 rounded animate-pulse" /> : (
            <p className="text-2xl font-bold text-gray-100">{formatNumber(m.clicks)}</p>
          )}
        </Card>
        <Card className="text-center p-6">
          <p className="text-gray-400 text-sm mb-2">Conversões</p>
          {loading ? <div className="h-8 w-20 mx-auto bg-dark-200 rounded animate-pulse" /> : (
            <p className="text-2xl font-bold text-brand-500">{formatNumber(m.conversions)}</p>
          )}
        </Card>
        <Card className="text-center p-6">
          <p className="text-gray-400 text-sm mb-2">Período</p>
          <p className="text-xl font-bold text-gray-100">
            {dateRange === 'today' && 'Hoje'}
            {dateRange === '3days' && '3 Dias'}
            {dateRange === '7days' && '7 Dias'}
            {dateRange === '30days' && '30 Dias'}
          </p>
        </Card>
      </div>
    </div>
  );
}
