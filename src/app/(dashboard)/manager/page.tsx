'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Input, Select, Button, Badge } from '@/components/ui';
import { Search, RefreshCw, Pause, Play, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { formatCurrency, formatPercent, formatNumber, formatRoas, getStatusColor, cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ManagerPage() {
  const { activeBC } = useAppStore();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    if (!activeBC?.bc_id) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/manager/campaigns?bc_id=${activeBC.bc_id}`);
      if (!res.ok) throw new Error('Falha ao buscar campanhas');
      const data = await res.json();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeBC?.bc_id]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleBulkAction = async (action: 'ENABLE' | 'DISABLE' | 'DELETE') => {
    if (selectedRows.length === 0) return;
    const actionLabel = action === 'ENABLE' ? 'ativar' : action === 'DISABLE' ? 'pausar' : 'deletar';
    setActionLoading(true);
    try {
      const grouped: Record<string, string[]> = {};
      selectedRows.forEach(cid => {
        const campaign = campaigns.find(c => c.campaign_id === cid);
        if (campaign) {
          if (!grouped[campaign.advertiser_id]) grouped[campaign.advertiser_id] = [];
          grouped[campaign.advertiser_id].push(cid);
        }
      });

      for (const [advertiserId, campaignIds] of Object.entries(grouped)) {
        const res = await fetch('/api/campaigns/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ advertiser_id: advertiserId, campaign_ids: campaignIds, action }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `Falha ao ${actionLabel}`);
        }
      }

      toast.success(`${selectedRows.length} campanha(s) ${action === 'ENABLE' ? 'ativada(s)' : action === 'DISABLE' ? 'pausada(s)' : 'deletada(s)'}`);
      setSelectedRows([]);
      fetchCampaigns();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = (c.campaign_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (!activeBC) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciador</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie suas campanhas, conjuntos e anúncios</p>
        </div>
        <div className="bg-white rounded-xl border border-[#f0e4e9] shadow-card hover-glow text-center py-16 px-6">
          <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={20} className="text-accent-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Conta TikTok não conectada</h2>
          <p className="text-sm text-gray-500 mb-6">Conecte sua conta para gerenciar campanhas.</p>
          <Link href="/settings"><Button size="lg">Ir para Configurações</Button></Link>
        </div>
      </div>
    );
  }

  const columns = [
    {
      key: 'status' as const, header: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'ENABLE' || value === 'ACTIVE' ? 'success' : value === 'DISABLE' || value === 'PAUSED' ? 'warning' : 'danger'}>
          {value === 'ENABLE' || value === 'ACTIVE' ? 'Ativo' : value === 'DISABLE' || value === 'PAUSED' ? 'Pausado' : value}
        </Badge>
      ),
    },
    { key: 'campaign_name' as const, header: 'Campanha' },
    { key: 'advertiser_name' as const, header: 'Conta' },
    { key: 'budget' as const, header: 'Orçamento', render: (v: number) => formatCurrency(v) },
    { key: 'spend' as const, header: 'Gasto', render: (v: number) => formatCurrency(v) },
    { key: 'impressions' as const, header: 'Impressões', render: (v: number) => formatNumber(v) },
    { key: 'clicks' as const, header: 'Cliques', render: (v: number) => formatNumber(v) },
    { key: 'conversions' as const, header: 'Conversões', render: (v: number) => formatNumber(v) },
    { key: 'cpa' as const, header: 'CPA', render: (v: number) => formatCurrency(v) },
    { key: 'ctr' as const, header: 'CTR', render: (v: number) => formatPercent(v) },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciador</h1>
          <p className="text-sm text-gray-500 mt-0.5">BC: {activeBC.name || activeBC.bc_id}</p>
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <Input placeholder="Buscar campanha..." icon={<Search size={18} />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Select options={[
            { value: 'all', label: 'Todos Status' },
            { value: 'ENABLE', label: 'Ativo' },
            { value: 'DISABLE', label: 'Pausado' },
          ]} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="md:w-48" />
          <Button variant="secondary" size="md" onClick={fetchCampaigns} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Atualizar
          </Button>
        </div>
      </Card>

      {selectedRows.length > 0 && (
        <div className="bg-gray-50 border border-[#f0e4e9] rounded-xl px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">{selectedRows.length} campanha(s) selecionada(s)</p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => handleBulkAction('DISABLE')} loading={actionLoading}>
                <Pause size={16} /> Pausar
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleBulkAction('ENABLE')} loading={actionLoading}>
                <Play size={16} /> Ativar
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleBulkAction('DELETE')} loading={actionLoading}>
                <Trash2 size={16} /> Deletar
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-500" />
            <p className="text-red-600 text-sm">{error}</p>
            <Button variant="secondary" size="sm" onClick={fetchCampaigns}>Tentar novamente</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-[#f0e4e9] shadow-card text-center py-12">
          <Loader2 className="animate-spin mx-auto mb-3 text-gray-400" size={32} />
          <p className="text-gray-500">Buscando campanhas do TikTok...</p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#f0e4e9] shadow-card hover-glow text-center py-12">
          <p className="text-gray-500 text-lg mb-2">Nenhuma campanha encontrada</p>
          <p className="text-gray-400 text-sm">Crie suas primeiras campanhas na aba "Campanhas".</p>
        </div>
      ) : (
        <>
          <Table columns={columns} data={filteredCampaigns.map(c => ({ ...c, id: c.campaign_id }))} selectable onSelectionChange={setSelectedRows} rowIdKey="id" />
          <div className="bg-white rounded-xl border border-[#f0e4e9] shadow-card px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Gasto</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(filteredCampaigns.reduce((s, c) => s + c.spend, 0))}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Impressões</p>
                <p className="text-lg font-bold text-gray-900">{formatNumber(filteredCampaigns.reduce((s, c) => s + c.impressions, 0))}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Cliques</p>
                <p className="text-lg font-bold text-gray-900">{formatNumber(filteredCampaigns.reduce((s, c) => s + c.clicks, 0))}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Conversões</p>
                <p className="text-lg font-bold text-accent-500">{formatNumber(filteredCampaigns.reduce((s, c) => s + c.conversions, 0))}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Campanhas</p>
                <p className="text-lg font-bold text-gray-900">{filteredCampaigns.length}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
