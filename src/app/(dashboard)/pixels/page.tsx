'use client';

import React, { useState } from 'react';
import { Card, Input, Button, Badge } from '@/components/ui';
import { Search, Zap, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatNumber } from '@/lib/utils';

// Mock pixel data
const mockAccounts = [
  {
    id: '1',
    accountName: 'Conta Premium 01',
    accountId: 'ACC-001',
    pixelId: 'PTX-1234567890',
    status: 'READY',
    eventsCount: 1245,
    lastFired: '2024-04-16 14:30:00',
  },
  {
    id: '2',
    accountName: 'Conta Premium 02',
    accountId: 'ACC-002',
    pixelId: 'PTX-0987654321',
    status: 'ATTENTION',
    eventsCount: 342,
    lastFired: '2024-04-16 08:15:00',
  },
  {
    id: '3',
    accountName: 'Conta Standard 01',
    accountId: 'ACC-003',
    pixelId: '',
    status: 'NO_PIXEL',
    eventsCount: 0,
    lastFired: '-',
  },
  {
    id: '4',
    accountName: 'Conta Premium 03',
    accountId: 'ACC-004',
    pixelId: 'PTX-1122334455',
    status: 'READY',
    eventsCount: 2103,
    lastFired: '2024-04-16 15:45:00',
  },
  {
    id: '5',
    accountName: 'Conta Standard 02',
    accountId: 'ACC-005',
    pixelId: 'PTX-5566778899',
    status: 'ATTENTION',
    eventsCount: 89,
    lastFired: '2024-04-15 22:30:00',
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'READY':
      return <CheckCircle size={20} className="text-green-400" />;
    case 'ATTENTION':
      return <AlertCircle size={20} className="text-yellow-400" />;
    case 'NO_PIXEL':
      return <Clock size={20} className="text-gray-400" />;
    default:
      return null;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'READY':
      return <Badge variant="success">Pronto</Badge>;
    case 'ATTENTION':
      return <Badge variant="warning">Atenção</Badge>;
    case 'NO_PIXEL':
      return <Badge variant="error">Sem Pixel</Badge>;
    default:
      return null;
  }
};

export default function PixelsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [accounts, setAccounts] = useState(mockAccounts);

  const stats = {
    total: accounts.length,
    ready: accounts.filter((a) => a.status === 'READY').length,
    attention: accounts.filter((a) => a.status === 'ATTENTION').length,
    noPixel: accounts.filter((a) => a.status === 'NO_PIXEL').length,
  };

  const filteredAccounts = accounts.filter((account) =>
    account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.accountId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Pixels sincronizados com sucesso!');
    } catch (error) {
      toast.error('Erro ao sincronizar pixels');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-50">Pixels</h1>
          <p className="text-gray-400 mt-1">Gerencie pixels de rastreamento de suas contas</p>
        </div>
        <Button
          onClick={handleSync}
          loading={isSyncing}
          disabled={isSyncing}
          size="lg"
        >
          <RefreshCw size={20} />
          SINCRONIZAR AGORA
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-6">
          <p className="text-gray-400 text-sm mb-2">Total de Contas</p>
          <p className="text-3xl font-bold text-gray-100">{stats.total}</p>
        </Card>
        <Card className="text-center p-6 border-green-900/50">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle size={16} className="text-green-400" />
            <p className="text-gray-400 text-sm">Prontas</p>
          </div>
          <p className="text-3xl font-bold text-green-400">{stats.ready}</p>
        </Card>
        <Card className="text-center p-6 border-yellow-900/50">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertCircle size={16} className="text-yellow-400" />
            <p className="text-gray-400 text-sm">Atenção</p>
          </div>
          <p className="text-3xl font-bold text-yellow-400">{stats.attention}</p>
        </Card>
        <Card className="text-center p-6 border-gray-900/50">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock size={16} className="text-gray-400" />
            <p className="text-gray-400 text-sm">Sem Pixel</p>
          </div>
          <p className="text-3xl font-bold text-gray-400">{stats.noPixel}</p>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Buscar por nome ou ID da conta..."
          icon={<Search size={18} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* Accounts List */}
      <div className="space-y-3">
        {filteredAccounts.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-400">Nenhuma conta encontrada</p>
          </Card>
        ) : (
          filteredAccounts.map((account) => (
            <Card key={account.id} className="hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between gap-4">
                {/* Left Side */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(account.status)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-100">
                        {account.accountName}
                      </h3>
                      <span className="text-xs text-gray-500 bg-dark-400 px-2 py-1 rounded">
                        {account.accountId}
                      </span>
                    </div>

                    {account.status !== 'NO_PIXEL' && (
                      <p className="text-sm text-gray-400 font-mono">
                        ID: {account.pixelId}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Eventos Capturados</p>
                        <p className="font-semibold text-gray-200">
                          {formatNumber(account.eventsCount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Último Evento</p>
                        <p className="font-semibold text-gray-200">
                          {account.lastFired}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Status Badge */}
                <div className="flex-shrink-0">
                  {getStatusBadge(account.status)}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Help Section */}
      <Card
        title="Precisa de Ajuda?"
        icon={<Zap size={24} />}
        className="border-brand-900/50"
      >
        <div className="space-y-3 text-sm text-gray-300">
          <p>
            <strong>Status "Pronto":</strong> O pixel está ativo e rastreando eventos
            corretamente.
          </p>
          <p>
            <strong>Status "Atenção":</strong> O pixel foi criado mas está com
            atividade baixa. Verifique a implementação.
          </p>
          <p>
            <strong>Status "Sem Pixel":</strong> Nenhum pixel foi criado para esta
            conta. Configure um novo pixel na plataforma TikTok.
          </p>
        </div>
      </Card>
    </div>
  );
}
