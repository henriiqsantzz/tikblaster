'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { Building2, RefreshCw, Users, ChevronDown, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn, getStatusColor } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function BusinessCentersPage() {
  const { activeBC, setActiveBC } = useAppStore();
  const [bcs, setBcs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedBC, setExpandedBC] = useState<string | null>(null);
  const [advertisers, setAdvertisers] = useState<Record<string, any[]>>({});
  const [syncingBC, setSyncingBC] = useState<string | null>(null);
  const [loadingAdvs, setLoadingAdvs] = useState<string | null>(null);

  const fetchBCs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/business-centers');
      if (!res.ok) throw new Error('Falha ao buscar Business Centers');
      const data = await res.json();
      setBcs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBCs(); }, []);

  const handleExpand = async (bcId: string) => {
    if (expandedBC === bcId) {
      setExpandedBC(null);
      return;
    }
    setExpandedBC(bcId);
    if (!advertisers[bcId]) {
      setLoadingAdvs(bcId);
      try {
        const res = await fetch(`/api/tiktok/advertisers?bc_id=${bcId}`);
        if (res.ok) {
          const data = await res.json();
          setAdvertisers(prev => ({ ...prev, [bcId]: Array.isArray(data) ? data : [] }));
        }
      } catch (err) {
        console.error('Error fetching advertisers:', err);
      } finally {
        setLoadingAdvs(null);
      }
    }
  };

  const handleSync = async (bcId: string) => {
    setSyncingBC(bcId);
    try {
      const res = await fetch('/api/tiktok/advertisers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bc_id: bcId }),
      });
      if (!res.ok) throw new Error('Falha ao sincronizar');
      const data = await res.json();
      toast.success(`${data.count || 0} anunciantes sincronizados`);
      const advRes = await fetch(`/api/tiktok/advertisers?bc_id=${bcId}&refresh=true`);
      if (advRes.ok) {
        const advData = await advRes.json();
        setAdvertisers(prev => ({ ...prev, [bcId]: Array.isArray(advData) ? advData : [] }));
      }
      fetchBCs();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSyncingBC(null);
    }
  };

  const handleSelect = (bc: any) => {
    setActiveBC({
      id: bc.bc_id,
      bc_id: bc.bc_id,
      name: bc.name,
      user_id: '',
      access_token: '',
      token_expires_at: bc.token_expires_at,
      created_at: bc.created_at,
      updated_at: bc.updated_at,
    });
    toast.success(`BC "${bc.name}" selecionado`);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Business Centers</h1>
          <p className="text-gray-500 mt-1">Carregando...</p>
        </div>
        {[1, 2].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Business Centers</h1>
          <p className="text-gray-500 mt-1">Gerencie seus Business Centers e contas de anunciantes</p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchBCs}>
          <RefreshCw size={16} /> Atualizar
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-500" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {bcs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-16 px-6">
          <Building2 size={48} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Nenhum Business Center conectado</h2>
          <p className="text-gray-500 mb-6">
            Conecte sua conta TikTok for Business nas configurações para vincular seus BCs.
          </p>
          <Link href="/settings">
            <Button size="lg">Conectar TikTok</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bcs.map((bc) => (
            <Card key={bc.bc_id} className={cn(
              'transition-all',
              activeBC?.bc_id === bc.bc_id && 'border-pink-300 shadow-md shadow-pink-100'
            )}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{bc.name}</h3>
                    {bc.is_expired ? (
                      <Badge variant="danger">Token Expirado</Badge>
                    ) : (
                      <Badge variant="success">Ativo</Badge>
                    )}
                    {activeBC?.bc_id === bc.bc_id && (
                      <Badge variant="info">Selecionado</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 font-mono">{bc.bc_id}</p>
                  <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users size={14} /> {bc.advertiser_count} anunciantes
                    </span>
                    <span>Token expira: {new Date(bc.token_expires_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSync(bc.bc_id)}
                    loading={syncingBC === bc.bc_id}
                    disabled={syncingBC === bc.bc_id}
                  >
                    <RefreshCw size={14} /> Sincronizar
                  </Button>
                  {activeBC?.bc_id !== bc.bc_id && (
                    <Button size="sm" onClick={() => handleSelect(bc)}>
                      <CheckCircle size={14} /> Selecionar
                    </Button>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleExpand(bc.bc_id)}
                className="mt-4 pt-4 border-t border-gray-100 w-full flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {expandedBC === bc.bc_id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                Ver anunciantes ({bc.advertiser_count})
              </button>

              {expandedBC === bc.bc_id && (
                <div className="mt-3 space-y-2">
                  {loadingAdvs === bc.bc_id ? (
                    <div className="py-4 text-center text-gray-500 text-sm">Carregando anunciantes...</div>
                  ) : (advertisers[bc.bc_id] || []).length === 0 ? (
                    <div className="py-4 text-center text-gray-400 text-sm">Nenhum anunciante encontrado</div>
                  ) : (
                    (advertisers[bc.bc_id] || []).map((adv: any) => (
                      <div key={adv.advertiser_id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between border border-gray-100">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{adv.advertiser_name}</p>
                          <p className="text-xs text-gray-500 font-mono">{adv.advertiser_id}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          {adv.balance !== undefined && (
                            <span className="text-sm text-gray-500">{adv.currency} {parseFloat(adv.balance || 0).toFixed(2)}</span>
                          )}
                          <span className={cn('text-xs font-medium', getStatusColor(adv.status || 'ACTIVE'))}>
                            {adv.status || 'ACTIVE'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {bcs.length > 0 && bcs.some((b: any) => b.is_expired) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-yellow-500" />
            <div>
              <p className="text-yellow-700 font-medium text-sm">Token expirado</p>
              <p className="text-gray-500 text-sm">Re-autentique nas configurações para renovar o token.</p>
            </div>
            <Link href="/settings" className="ml-auto">
              <Button variant="secondary" size="sm">Re-autenticar</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
