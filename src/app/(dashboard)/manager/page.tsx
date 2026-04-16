'use client';

import React, { useState } from 'react';
import { Card, Table, Tabs, Input, Select, Button } from '@/components/ui';
import { Search, RefreshCw, Pause, Play, Trash2 } from 'lucide-react';
import { formatCurrency, formatPercent, formatNumber, formatRoas, getStatusColor } from '@/lib/utils';

// Mock campaign data
const mockCampaigns = [
  {
    id: '1',
    status: 'ACTIVE',
    campaign: 'Campanha Verão 2024',
    delivery: '5 de 7 dias',
    budget: 5000,
    sales: 8945.30,
    cpa: 42.50,
    spend: 5234.80,
    revenue: 8945.30,
    impressions: 597000,
    clicks: 13981,
    roas: 1.71,
    roi: 71,
  },
  {
    id: '2',
    status: 'PAUSED',
    campaign: 'Black Friday Promo',
    delivery: '3 de 7 dias',
    budget: 3000,
    sales: 5123.45,
    cpa: 38.20,
    spend: 3200.50,
    revenue: 5123.45,
    impressions: 412000,
    clicks: 9854,
    roas: 1.60,
    roi: 60,
  },
  {
    id: '3',
    status: 'ACTIVE',
    campaign: 'Novo Produto Launch',
    delivery: '6 de 7 dias',
    budget: 7000,
    sales: 12340.50,
    cpa: 45.30,
    spend: 7850.20,
    revenue: 12340.50,
    impressions: 725000,
    clicks: 16234,
    roas: 1.57,
    roi: 57,
  },
  {
    id: '4',
    status: 'ACTIVE',
    campaign: 'Retargeting Campaign',
    delivery: '7 de 7 dias',
    budget: 2000,
    sales: 6234.80,
    cpa: 32.10,
    spend: 1950.40,
    revenue: 6234.80,
    impressions: 289000,
    clicks: 8234,
    roas: 3.19,
    roi: 219,
  },
];

export default function ManagerPage() {
  const [selectedTab, setSelectedTab] = useState('campaigns');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleRefresh = () => {
    console.log('Refresh campaigns');
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action}`, selectedRows);
  };

  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    const matchesSearch = campaign.campaign
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || campaign.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'status' as const,
      header: 'Status',
      render: (value: string) => (
        <span className={`font-medium ${getStatusColor(value)}`}>
          {value === 'ACTIVE' ? 'Ativo' : value === 'PAUSED' ? 'Pausado' : value}
        </span>
      ),
    },
    {
      key: 'campaign' as const,
      header: 'Campanha',
      sortable: true,
    },
    {
      key: 'delivery' as const,
      header: 'Entrega',
    },
    {
      key: 'budget' as const,
      header: 'Orçamento',
      render: (value: number) => formatCurrency(value),
    },
    {
      key: 'sales' as const,
      header: 'Vendas',
      render: (value: number) => (
        <span className="text-brand-400">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'cpa' as const,
      header: 'CPA',
      render: (value: number) => formatCurrency(value),
    },
    {
      key: 'spend' as const,
      header: 'Gasto',
      render: (value: number) => formatCurrency(value),
    },
    {
      key: 'revenue' as const,
      header: 'Receita',
      render: (value: number) => (
        <span className="text-green-400">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'impressions' as const,
      header: 'Impressões',
      render: (value: number) => formatNumber(value),
    },
    {
      key: 'clicks' as const,
      header: 'Cliques',
      render: (value: number) => formatNumber(value),
    },
    {
      key: 'roas' as const,
      header: 'ROAS',
      render: (value: number) => (
        <span className="font-semibold text-brand-400">{formatRoas(value)}</span>
      ),
    },
    {
      key: 'roi' as const,
      header: 'ROI',
      render: (value: number) => (
        <span className={value > 0 ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
          {formatPercent(value)}
        </span>
      ),
    },
  ];

  const totals = {
    budget: filteredCampaigns.reduce((sum, c) => sum + c.budget, 0),
    sales: filteredCampaigns.reduce((sum, c) => sum + c.sales, 0),
    cpa: filteredCampaigns.reduce((sum, c) => sum + c.cpa, 0) / filteredCampaigns.length,
    spend: filteredCampaigns.reduce((sum, c) => sum + c.spend, 0),
    revenue: filteredCampaigns.reduce((sum, c) => sum + c.revenue, 0),
    impressions: filteredCampaigns.reduce((sum, c) => sum + c.impressions, 0),
    clicks: filteredCampaigns.reduce((sum, c) => sum + c.clicks, 0),
    roas: filteredCampaigns.reduce((sum, c) => sum + c.roas, 0) / filteredCampaigns.length,
    roi: filteredCampaigns.reduce((sum, c) => sum + c.roi, 0) / filteredCampaigns.length,
  };

  const tabs = [
    {
      id: 'campaigns',
      label: 'Campanhas',
      content: (
        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <Input
                  placeholder="Buscar campanha..."
                  icon={<Search size={18} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                options={[
                  { value: 'all', label: 'Todos Status' },
                  { value: 'ACTIVE', label: 'Ativo' },
                  { value: 'PAUSED', label: 'Pausado' },
                ]}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="md:w-48"
              />
              <Button variant="secondary" size="md" onClick={handleRefresh}>
                <RefreshCw size={18} />
                Atualizar
              </Button>
            </div>
          </Card>

          {/* Bulk Actions */}
          {selectedRows.length > 0 && (
            <Card className="bg-dark-400/50 border-brand-900">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-300">
                  {selectedRows.length} campanha(s) selecionada(s)
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleBulkAction('pause')}
                  >
                    <Pause size={16} />
                    Pausar
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleBulkAction('resume')}
                  >
                    <Play size={16} />
                    Ativar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleBulkAction('delete')}
                  >
                    <Trash2 size={16} />
                    Deletar
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Table */}
          <Table
            columns={columns}
            data={filteredCampaigns}
            selectable
            onSelectionChange={setSelectedRows}
            rowIdKey="id"
          />

          {/* Totals */}
          <Card className="bg-dark-400/50">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Gasto</p>
                <p className="text-lg font-bold text-gray-100">
                  {formatCurrency(totals.spend)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Receita</p>
                <p className="text-lg font-bold text-green-400">
                  {formatCurrency(totals.revenue)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">CPA Médio</p>
                <p className="text-lg font-bold text-gray-100">
                  {formatCurrency(totals.cpa)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Impressões</p>
                <p className="text-lg font-bold text-gray-100">
                  {formatNumber(totals.impressions)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">ROAS Médio</p>
                <p className="text-lg font-bold text-brand-400">
                  {formatRoas(totals.roas)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">ROI Médio</p>
                <p className="text-lg font-bold text-green-400">
                  {formatPercent(totals.roi)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: 'adsets',
      label: 'Conjuntos',
      content: (
        <Card>
          <p className="text-gray-400">Funcionalidade em desenvolvimento...</p>
        </Card>
      ),
    },
    {
      id: 'ads',
      label: 'Anúncios',
      content: (
        <Card>
          <p className="text-gray-400">Funcionalidade em desenvolvimento...</p>
        </Card>
      ),
    },
    {
      id: 'accounts',
      label: 'Contas',
      content: (
        <Card>
          <p className="text-gray-400">Funcionalidade em desenvolvimento...</p>
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-50">Gerenciador</h1>
        <p className="text-gray-400 mt-1">Gerencie suas campanhas, conjuntos e anúncios</p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        defaultTab="campaigns"
        onChange={setSelectedTab}
        size="lg"
      />
    </div>
  );
}
