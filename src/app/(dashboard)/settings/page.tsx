'use client';

import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Toggle } from '@/components/ui';
import { User, Bell, Link as LinkIcon, Shield, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [businessCenters, setBusinessCenters] = useState<any[]>([]);
  const [notifications, setNotifications] = useState({
    pushEnabled: false,
    campaignUpdates: true,
  });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || '');
        }

        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setTiktokConnected(data.tiktok_connected);
          setBusinessCenters(data.business_centers || []);
        }

        if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
            const swReady = Promise.race([
              navigator.serviceWorker.ready,
              new Promise((_, reject) => setTimeout(() => reject(new Error('SW timeout')), 3000))
            ]);
            const reg = await swReady as ServiceWorkerRegistration;
            const sub = await reg.pushManager.getSubscription();
            setNotifications(prev => ({ ...prev, pushEnabled: !!sub }));
          } catch (swErr) {
            // Service worker not ready, ignore
          }
        }
      } catch (err) {
        console.error('Settings init error:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleConnectTikTok = () => {
    window.location.href = '/api/tiktok/auth';
  };

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (passwordForm.new.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    setChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
      if (error) throw error;
      toast.success('Senha alterada com sucesso!');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.message || 'Erro ao alterar senha');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleTogglePush = async () => {
    try {
      if (notifications.pushEnabled) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          await fetch('/api/notifications/subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
        }
        setNotifications(prev => ({ ...prev, pushEnabled: false }));
        toast.success('Notificações push desativadas');
      } else {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: sub.endpoint,
            keys: {
              p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!))),
              auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!))),
            },
          }),
        });
        setNotifications(prev => ({ ...prev, pushEnabled: true }));
        toast.success('Notificações push ativadas');
      }
    } catch (err) {
      toast.error('Erro ao configurar notificações push');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-sm text-gray-500 mt-0.5">Carregando...</p>
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gerencie suas preferências e integrações</p>
      </div>

      {/* Profile Section */}
      <Card title="Perfil" icon={<User size={20} />}>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-[#f0e4e9]">
            <p className="text-xs text-gray-500 mb-1">Email</p>
            <p className="text-sm text-gray-900 font-medium">{userEmail}</p>
          </div>

          <div className="pt-4 border-t border-[#f0e4e9]">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Alterar Senha</h4>
            <div className="space-y-3">
              <Input
                label="Nova Senha"
                type="password"
                value={passwordForm.new}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                placeholder="Mínimo 6 caracteres"
              />
              <Input
                label="Confirmar Nova Senha"
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                placeholder="Repita a nova senha"
              />
              <Button
                onClick={handleChangePassword}
                size="md"
                loading={changingPassword}
                disabled={!passwordForm.new || !passwordForm.confirm}
              >
                Alterar Senha
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* TikTok Integration Section */}
      <Card title="Integração TikTok" icon={<LinkIcon size={20} />}>
        <div className="space-y-4">
          {tiktokConnected ? (
            <>
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <p className="text-sm font-medium text-emerald-700">Conectado</p>
                </div>
                {businessCenters.map((bc: any) => (
                  <div key={bc.bc_id} className="mb-3 last:mb-0">
                    <p className="text-sm text-gray-600">
                      Business Center: <span className="font-mono text-gray-900">{bc.name}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {bc.bc_id}
                    </p>
                    <p className="text-xs text-gray-500">
                      Token expira em: {new Date(bc.token_expires_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" size="md" onClick={handleConnectTikTok}>
                  <RefreshCw size={16} />
                  Re-autenticar
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  <p className="text-sm font-medium text-amber-700">Desconectado</p>
                </div>
                <p className="text-sm text-gray-600">
                  Conecte sua conta TikTok for Business para usar todas as funcionalidades do ShadowAds.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Você será redirecionado para o TikTok para autorizar o acesso.
                </p>
              </div>
              <Button onClick={handleConnectTikTok} size="lg" className="w-full">
                Conectar Conta TikTok
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Notifications Section */}
      <Card title="Notificações" icon={<Bell size={20} />}>
        <div className="space-y-4">
          <Toggle
            label="Notificações Push"
            description="Receber notificações push sobre status de campanhas e contas"
            checked={notifications.pushEnabled}
            onChange={handleTogglePush}
          />
        </div>
      </Card>

      {/* Security */}
      <Card title="Segurança" icon={<Shield size={20} />}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Suas credenciais TikTok são armazenadas de forma segura e criptografada.
            Os tokens de acesso expiram automaticamente após 30 dias.
          </p>
        </div>
      </Card>
    </div>
  );
}
