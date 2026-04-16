'use client';

import React, { useState } from 'react';
import { Card, Badge } from '@/components/ui';
import { TrendingUp, TrendingDown, DollarSign, Eye, Mouse, Target, BarChart3 } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent, formatRoas } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for hourly sales
const hourlyData = [
  { hour: '00:00', revenue: 145.50, spend: 98.30, conversions: 12 },
  { hour: '01:00', revenue: 187.20, spend: 124.50, conversions: 16 },
  { hour: '02:00', revenue: 210.80, spend: 142.10, conversions: 18 },
  { hour: '03:00', revenue: 156.30, spend: 105.20, conversions: 13 },
  { hour: '04:00', revenue: 198.50, spend: 133.40, conversions: 17 },
  { hour: '05:00', revenue: 224.60, spend: 151.20, conversions: 19 },
  { hour: '06:00', revenue: 245.80, spend: 165.30, conversions: 21 },
  { hour: '07:00', revenue: 312.40, spend: 210.15, conversions: 26 },
  { hour: '08:00', revenue: 385.20, spend: 259.30, conversions: 33 },
  { hour: '09:00', revenue: 421.50, spend: 283.45, conversions: 36 },
  { hour: '10:00', revenue: 392.10, spend: 264.20, conversions: 33 },
  { hour: '11:00', revenue: 352.80, spend: 237.50, conversions: 30 },
  { hour: '12:00', revenue: 498.30, spend: 335.40, conversions: 42 },
  { hour: '13:00', revenue: 512.60, spend: 345.20, conversions: 43 },
  { hour: '14:00', revenue: 445.20, spend: 299.50, conversions: 38 },
  { hour: '15:00', revenue: 478.90, spend: 322.30, conversions: 41 },
  { hour: '16:00', revenue: 425.50, spend: 286.40, conversions: 36 },
  { hour: '17:00', revenue: 392.20, spend: 264.10, conversions: 33 },
  { hour: '18:00', revenue: 468.70, spend: 315.40, conversions: 40 },
  { hour: '19:00', revenue: 512.30, spend: 344.80, conversions: 43 },
  { hour: '20:00', revenue: 545.60, spend: 367.30, conversions: 46 },
  { hour: '21:00', revenue: 523.40, spend: 352.10, conversions: 44 },
  { hour: '22:00', revenue: 456.70, spend: 307.40, conversions: 39 },
  { hour: '23:00', revenue: 381.20, spend: 256.80, conversions: 32 },
];

// Analytics Card Component
const AnalyticsCard = ({
  title,
  value,
  trend,
  icon: Icon,
  suffix = '',
}: {
  title: string;
  value: string | number;
  trend?: 'UP' | 'DOWN' | 'STABLE';
  icon: React.ReactNode;
  suffix?: string;
}) => {
  const getTrendColor = (t?: string) => {
    switch (t) {
      case 'UP':
        return 'text-green-400';
      case 'DOWN':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTrendIcon = (t?: string) => {
    switch (t) {
      case 'UP':
        return <TrendingUp size={16} />;
      case 'DOWN':
        return <TrendingDown size={16} />;
      default:
        return null;
    }
  };

  return (
    <Card className="flex items-start justify-between p-6">
      <div className="flex-1">
        <p className="text-sm text-gray-400 mb-2">{title}</p>
        <p className="text-2xl font-bold text-gray-100">
          {value}
          {suffix && <span className="text-lg text-gray-400 ml-1">{suffix}</span>}
        </p>
        {trend && (
          <div className={cn('flex items-center gap-1 mt-3 text-sm font-medium', getTrendColor(trend))}>
            {getTrendIcon(trend)}
            {trend === 'UP' && 'Crescimento'}
            {trend === 'DOWN' && 'Redução'}
            {trend === 'STABLE' && 'Estável'}
          </div>
        )}
      </div>
      <div className="text-brand-500 flex-shrink-0">{Icon}</div>
    </Card>
  );
};

import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [dateRange] = useState('today');

  const metrics = {
    revenue: 8945.30,
    spend: 5234.80,
    cpa: 42.50,
    cpm: 8.75,
    ctr: 2.34,
    impressions: 597000,
    clicks: 13981,
    conversions: 210,
    roas: 1.71,
    activeAccounts: 24,
  };

  const totalRevenue = hourlyData.reduce((sum, d) => sum + d.revenue, 0);
  const totalSpend = hourlyData.reduce((sum, d) => sum + d.spend, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-50">Dashboard</h1>
        <p className="text-gray-400 mt-1">Acompanhe o desempenho das suas campanhas</p>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-2">
          <AnalyticsCard
            title="Faturamento"
            value={formatCurrency(metrics.revenue)}
            trend="UP"
            icon={<DollarSign size={28} />}
          />
        </div>
        <div className="lg:col-span-2">
          <AnalyticsCard
            title="Gasto em Anúncios"
            value={formatCurrency(metrics.spend)}
            trend="DOWN"
            icon={<BarChart3 size={28} />}
          />
        </div>
        <div className="lg:col-span-1">
          <AnalyticsCard
            title="CPA"
            value={formatCurrency(metrics.cpa)}
            trend="STABLE"
            icon={<Target size={28} />}
          />
        </div>
        <div className="lg:col-span-1">
          <AnalyticsCard
            title="CPM"
            value={formatCurrency(metrics.cpm)}
            icon={<Eye size={28} />}
          />
        </div>
      </div>

      {/* Second Row of Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <AnalyticsCard
          title="CTR"
          value={formatPercent(metrics.ctr)}
          trend="UP"
          icon={<Mouse size={28} />}
        />
        <AnalyticsCard
          title="Contas Ativas"
          value={metrics.activeAccounts}
          icon={<BarChart3 size={28} />}
        />

        {/* ROAS Badge */}
        <Card className="lg:col-span-2 flex items-center justify-between p-6">
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-2">ROAS</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-brand-500">{formatRoas(metrics.roas)}</p>
              <Badge variant="success" className="text-sm">Excelente</Badge>
            </div>
          </div>
          <div className="text-brand-500 flex-shrink-0">
            <TrendingUp size={32} />
          </div>
        </Card>

        {/* BC Balance Card */}
        <Card className="lg:col-span-2 flex items-center justify-between p-6">
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-2">Saldo BC</p>
            <p className="text-2xl font-bold text-gray-100">
              {formatCurrency(15423.50)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Crédito disponível</p>
          </div>
          <div className="text-brand-500 flex-shrink-0">
            <DollarSign size={32} />
          </div>
        </Card>
      </div>

      {/* Hourly Sales Chart */}
      <Card title="Vendas por Hora" subtitle="Últimas 24 horas">
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={hourlyData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e6a0" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#00e6a0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2128" />
              <XAxis
                dataKey="hour"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#9ca3af' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#13161b',
                  border: '1px solid #1e2128',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#00e6a0"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Faturamento"
              />
              <Area
                type="monotone"
                dataKey="spend"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#colorSpend)"
                name="Gasto"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-dark-100">
          <div>
            <p className="text-xs text-gray-500 mb-1">Total de Faturamento</p>
            <p className="text-lg font-bold text-brand-500">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Total de Gasto</p>
            <p className="text-lg font-bold text-amber-500">
              {formatCurrency(totalSpend)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">ROAS Médio</p>
            <p className="text-lg font-bold text-gray-100">
              {formatRoas(totalRevenue / totalSpend)}
            </p>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-6">
          <p className="text-gray-400 text-sm mb-2">Impressões</p>
          <p className="text-2xl font-bold text-gray-100">
            {formatNumber(metrics.impressions)}
          </p>
        </Card>
        <Card className="text-center p-6">
          <p className="text-gray-400 text-sm mb-2">Cliques</p>
          <p className="text-2xl font-bold text-gray-100">
            {formatNumber(metrics.clicks)}
          </p>
        </Card>
        <Card className="text-center p-6">
          <p className="text-gray-400 text-sm mb-2">Conversões</p>
          <p className="text-2xl font-bold text-brand-500">
            {formatNumber(metrics.conversions)}
          </p>
        </Card>
        <Card className="text-center p-6">
          <p className="text-gray-400 text-sm mb-2">Data Range</p>
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
