'use client';

import React, { useState } from 'react';
import { Card, Input, Button, Toggle } from '@/components/ui';
import { User, Lock, Bell, Link as LinkIcon, Copy, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: 'João Silva',
    email: 'joao@tikblaster.com',
    phone: '(11) 98765-4321',
  });

  const [tiktokAuth, setTiktokAuth] = useState({
    isConnected: true,
    businessCenterId: 'BC-2024-001',
  });

  const [notifications, setNotifications] = useState({
    pushEnabled: true,
    emailAlerts: true,
    campaignUpdates: true,
  });

  const [apiKeys, setApiKeys] = useState([
    {
      id: '1',
      name: 'API Key Principal',
      key: 'tib_sk_live_****_****',
      created: '2024-04-01',
      lastUsed: '2024-04-16 14:30:00',
    },
  ]);

  const [showApiKey, setShowApiKey] = useState<string | null>(null);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = () => {
    toast.success('Perfil atualizado com sucesso!');
  };

  const handleToggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success('Notificações atualizadas');
  };

  const handleConnectTikTok = () => {
    toast.success('Redirecionando para autenticação TikTok...');
  };

  const handleDisconnectTikTok = () => {
    setTiktokAuth({ isConnected: false, businessCenterId: '' });
    toast.success('Desconectado da conta TikTok');
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API Key copiada!');
  };

  const handleGenerateApiKey = () => {
    toast.success('Nova API Key gerada!');
  };

  const handleDeleteApiKey = (id: string) => {
    setApiKeys((prev) => prev.filter((key) => key.id !== id));
    toast.success('API Key deletada');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-50">Configurações</h1>
        <p className="text-gray-400 mt-1">Gerencie suas preferências e integrações</p>
      </div>

      {/* Profile Section */}
      <Card title="Perfil" icon={<User size={24} />}>
        <div className="space-y-4">
          <Input
            label="Nome Completo"
            name="name"
            value={profile.name}
            onChange={handleProfileChange}
            placeholder="Seu nome"
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={profile.email}
            onChange={handleProfileChange}
            placeholder="seu@email.com"
          />

          <Input
            label="Telefone"
            name="phone"
            value={profile.phone}
            onChange={handleProfileChange}
            placeholder="(XX) XXXXX-XXXX"
          />

          <div className="pt-4 border-t border-dark-100 flex gap-3">
            <Button onClick={handleSaveProfile} size="md">
              Salvar Alterações
            </Button>
            <Button variant="secondary" size="md">
              Alterar Senha
            </Button>
          </div>
        </div>
      </Card>

      {/* TikTok Integration Section */}
      <Card title="Integração TikTok" icon={<LinkIcon size={24} />}>
        <div className="space-y-4">
          {tiktokAuth.isConnected ? (
            <>
              <div className="bg-dark-400/50 rounded-lg p-4 border border-green-900/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <p className="text-sm font-medium text-green-400">Conectado</p>
                </div>
                <p className="text-sm text-gray-300">
                  Business Center ID: <span className="font-mono">{tiktokAuth.businessCenterId}</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Último sincronizado: 2024-04-16 15:30:00
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" size="md">
                  Re-autenticar
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={handleDisconnectTikTok}
                >
                  Desconectar
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-dark-400/50 rounded-lg p-4 border border-yellow-900/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <p className="text-sm font-medium text-yellow-400">Desconectado</p>
                </div>
                <p className="text-sm text-gray-300">
                  Você precisa conectar sua conta TikTok para usar o TikBlaster
                </p>
              </div>

              <Button onClick={handleConnectTikTok} size="md">
                Conectar Conta TikTok
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Notifications Section */}
      <Card title="Notificações" icon={<Bell size={24} />}>
        <div className="space-y-4">
          <Toggle
            label="Notificações Push"
            description="Receber notificações push no navegador e mobile"
            checked={notifications.pushEnabled}
            onChange={() => handleToggleNotification('pushEnabled')}
          />

          <Toggle
            label="Alertas por Email"
            description="Receber alertas e relatórios por email"
            checked={notifications.emailAlerts}
            onChange={() => handleToggleNotification('emailAlerts')}
          />

          <Toggle
            label="Atualizações de Campanhas"
            description="Notificações sobre mudanças nas suas campanhas"
            checked={notifications.campaignUpdates}
            onChange={() => handleToggleNotification('campaignUpdates')}
          />
        </div>
      </Card>

      {/* API Keys Section */}
      <Card title="API Keys" icon={<Lock size={24} />}>
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Use essas chaves para acessar a API do TikBlaster de forma segura.
          </p>

          {/* API Keys List */}
          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="bg-dark-400/50 rounded-lg p-4 border border-dark-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-100 mb-2">
                      {apiKey.name}
                    </h4>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-dark-300 px-2 py-1.5 rounded font-mono text-gray-400 truncate">
                          {showApiKey === apiKey.id ? apiKey.key : apiKey.key.replace(/sk_live_.*_/, 'sk_live_****_')}
                        </code>
                        <button
                          onClick={() =>
                            setShowApiKey(
                              showApiKey === apiKey.id ? null : apiKey.id
                            )
                          }
                          className="p-1.5 hover:bg-dark-300 rounded transition-all"
                          title="Mostrar/Ocultar"
                        >
                          {showApiKey === apiKey.id ? (
                            <EyeOff size={16} className="text-gray-400" />
                          ) : (
                            <Eye size={16} className="text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopyApiKey(apiKey.key)}
                          className="p-1.5 hover:bg-dark-300 rounded transition-all"
                          title="Copiar"
                        >
                          <Copy size={16} className="text-gray-400" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                        <div>
                          <p>Criada em</p>
                          <p className="text-gray-300">{apiKey.created}</p>
                        </div>
                        <div>
                          <p>Último uso</p>
                          <p className="text-gray-300">{apiKey.lastUsed}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteApiKey(apiKey.id)}
                    className="px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded transition-all"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Generate New Key */}
          <div className="pt-4 border-t border-dark-100">
            <Button onClick={handleGenerateApiKey} variant="secondary" size="md">
              Gerar Nova API Key
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card
        title="Zona de Perigo"
        className="border-red-900/50"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Essas ações são permanentes e não podem ser desfeitas.
          </p>

          <Button variant="danger" size="md">
            Deletar Conta
          </Button>
        </div>
      </Card>
    </div>
  );
}
