'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Megaphone,
  Settings,
  History,
  Menu,
  X,
  ChevronDown,
  Smartphone,
  Zap,
  Sliders,
  BarChart3,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { createClient } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  warning?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    sidebarOpen,
    toggleSidebar,
    activeBC,
    businessCenters,
    setActiveBC,
    setBusinessCenters,
    setAdvertisers,
  } = useAppStore();
  const [bcOpen, setBcOpen] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Get user info from Supabase
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || '');
          setUserName(user.email?.split('@')[0] || 'Usuário');
        }

        // Get TikTok connection status and BCs
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setTiktokConnected(data.tiktok_connected);

          if (data.business_centers && data.business_centers.length > 0) {
            const bcs = data.business_centers.map((bc: any) => ({
              id: bc.bc_id,
              bc_id: bc.bc_id,
              name: bc.name,
              user_id: data.user.id,
              access_token: '',
              token_expires_at: bc.token_expires_at,
              created_at: bc.created_at,
              updated_at: bc.updated_at,
            }));
            setBusinessCenters(bcs);

            // Auto-select first BC if none active
            if (!activeBC && bcs.length > 0) {
              setActiveBC(bcs[0]);
            }
          }
        }
      } catch (err) {
        console.error('Sidebar init error:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Fetch advertisers when activeBC changes
  useEffect(() => {
    if (activeBC?.bc_id) {
      fetch(`/api/tiktok/advertisers?bc_id=${activeBC.bc_id}`)
        .then((res) => res.ok ? res.json() : [])
        .then((data) => {
          if (Array.isArray(data)) {
            setAdvertisers(data.map((a: any) => ({
              id: a.advertiser_id || a.id,
              advertiser_id: a.advertiser_id,
              advertiser_name: a.advertiser_name,
              bc_id: activeBC.bc_id,
              status: a.status || 'ACTIVE',
              balance: a.balance || 0,
              currency: a.currency || 'BRL',
              timezone: a.timezone || '',
              created_at: a.created_at || '',
            })));
          }
        })
        .catch(console.error);
    }
  }, [activeBC?.bc_id]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const mainNavItems: NavSection[] = [
    {
      title: 'Principal',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { label: 'Business Centers', href: '/business-centers', icon: <Building2 size={20} /> },
        { label: 'Campanhas', href: '/campaigns', icon: <Megaphone size={20} /> },
        { label: 'Gerenciador', href: '/manager', icon: <BarChart3 size={20} /> },
        { label: 'Histórico', href: '/history', icon: <History size={20} /> },
      ],
    },
    {
      title: 'Operação',
      items: [
        { label: 'Criação de Contas', href: '/accounts', icon: <Smartphone size={20} /> },
        { label: 'Pixels', href: '/pixels', icon: <Zap size={20} /> },
      ],
    },
    {
      title: 'Sistema',
      items: [
        {
          label: 'Configurações',
          href: '/settings',
          icon: <Settings size={20} />,
          warning: !tiktokConnected,
        },
      ],
    },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-40 lg:hidden bg-dark-300 hover:bg-dark-200 text-gray-200 p-2 rounded-lg transition-all"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-dark-300 border-r border-dark-100 flex flex-col z-30 transition-transform duration-300 w-64',
          !sidebarOpen && '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-dark-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center text-dark-500 font-bold text-lg">
            T
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-50">TikBlaster</h1>
            <p className="text-xs text-gray-400">TikTok Ads Manager</p>
          </div>
        </div>

        {/* BC Selector */}
        <div className="px-4 py-4 border-b border-dark-100">
          {businessCenters.length === 0 ? (
            <Link
              href="/settings"
              className="w-full px-3 py-2 rounded-lg bg-yellow-900/20 border border-yellow-700/50 flex items-center gap-2 text-sm text-yellow-400 transition-all hover:bg-yellow-900/30"
            >
              <AlertTriangle size={16} />
              <span>Conectar TikTok</span>
            </Link>
          ) : (
            <>
              <button
                onClick={() => setBcOpen(!bcOpen)}
                className="w-full px-3 py-2 rounded-lg bg-dark-200 hover:bg-dark-100 border border-dark-100 flex items-center justify-between text-sm text-gray-200 transition-all"
              >
                <span className="font-medium truncate">
                  {activeBC?.name || 'Selecionar BC'}
                </span>
                <ChevronDown
                  size={16}
                  className={cn('transition-transform flex-shrink-0', bcOpen ? 'rotate-180' : '')}
                />
              </button>
              {bcOpen && (
                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {businessCenters.map((bc) => (
                    <button
                      key={bc.bc_id}
                      onClick={() => setActiveBC(bc)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded text-xs transition-all',
                        activeBC?.bc_id === bc.bc_id
                          ? 'bg-dark-100 text-brand-400 border border-brand-900'
                          : 'text-gray-400 hover:bg-dark-200'
                      )}
                    >
                      <div className="font-medium truncate">{bc.name}</div>
                      <div className="text-gray-500 mt-0.5">{bc.bc_id}</div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          {mainNavItems.map((section, idx) => (
            <div key={idx} className="mb-8">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium',
                      isActive(item.href)
                        ? 'bg-brand-500 text-dark-500 shadow-lg'
                        : 'text-gray-300 hover:bg-dark-200 hover:text-gray-100'
                    )}
                    onClick={() => {
                      if (window.innerWidth < 1024) toggleSidebar();
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.warning && (
                      <span className="ml-auto">
                        <AlertTriangle size={14} className="text-yellow-400" />
                      </span>
                    )}
                    {item.badge ? (
                      <span className="ml-auto text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Info */}
        <div className="px-4 py-4 border-t border-dark-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-dark-500 font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-100 truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-dark-200 rounded transition-all text-gray-400 hover:text-gray-200"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
