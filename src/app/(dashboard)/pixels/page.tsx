'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { Zap, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function PixelsPage() {
  const { activeBC } = useAppStore();
  const [pixels, setPixels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  const fetchPixels = async () => {
    if (!activeBC?.bc_id) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/pixels?bc_id=${activeBC.bc_id}`);
      if (!res.ok) throw new Error('Falha ao buscar pixels');
      const data = await res.json();
      setPixels(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPixels(); }, [activeBC?.bc_id]);

  const handleSync = async () => {
    if (!activeBC?.bc_id) return;
    setSyncing(true);
    try {
      const res = await fetch('/api/pixels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bc_id: activeBC.bc_id }),
      });
      if (!res.ok) throw new Error('Falha ao sincronizar');
      toast.success('Pixels sincronizados');
      fetchPixels();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSyncing(false);
    }
  };

  if (!activeBC) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-50">Pixels</h1>
          <p className="text-gray-400 mt-1">Gerencie seus pixels de conversão</p>
        </div>
        <Card className="text-center py-16">
          <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-400" />
          <h2 className="text-xl font-bold text-gray-100 mb-2">Conta TikTok não conectada</h2>
          <p className="text-gray-400 mb-6">Conecte sua conta para ver seus pixels.</p>
          <Link href="/settings"><Button size="lg">Ir para Configurações</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-50">Pixels</h1>
          <p className="text-gray-400 mt-1">Gerencie seus pixels de conversão - BC: {activeBC.name || activeBC.bc_id}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleSync} loading={syncing} disabled={syncing}>
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} /> Sincronizar Pixels
        </Button>
      </div>

      {error && (
        <Card className="border-red-900/50 bg-red-900/10">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </Card>
      )}

      {loading ? (
        <Card className="text-center py-12">
          <Loader2 className="animate-spin mx-auto mb-3 text-brand-500" size={32} />
          <p className="text-gray-400">Buscando pixels...</p>
        </Card>
      ) : pixels.length === 0 ? (
        <Card className="text-center py-12">
          <Zap size={48} className="mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400 text-lg mb-2">Nenhum pixel encontrado</p>
          <p className="text-gray-500 text-sm">Crie pixels no TikTok Ads Manager e sincronize aqui.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pixels.map((pixel: any) => (
            <Card key={pixel.pixel_id || pixel.id} className="hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap size={20} className="text-brand-500" />
                  <h3 className="font-semibold text-gray-100">{pixel.pixel_name || pixel.name}</h3>
                </div>
                <Badge variant={pixel.status === 'ACTIVE' || pixel.status === 'active' ? 'success' : 'warning'}>
                  {pixel.status === 'ACTIVE' || pixel.status === 'active' ? 'Ativo' : pixel.status}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Pixel ID</span>
                  <span className="text-gray-300 font-mono">{pixel.pixel_id}</span>
                </div>
                {pixel.advertiser_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Conta</span>
                    <span className="text-gray-300 font-mono">{pixel.advertiser_id}</span>
                  </div>
                )}
                {pixel.events && pixel.events.length > 0 && (
                  <div className="pt-2 border-t border-dark-100">
                    <p className="text-gray-400 text-xs mb-1">Eventos:</p>
                    {pixel.events.map((event: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-gray-300">{event.event_name}</span>
                        <span className="text-gray-500">{event.event_count} disparos</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
