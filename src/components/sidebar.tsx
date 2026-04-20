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
  Trophy,
  Plug,
  Code,
  Crosshair,
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
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || '');
          setUserName(user.email?.split('@')[0] || 'Seller');
        }

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

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Campanhas', href: '/campaigns', icon: <Megaphone size={20} /> },
    { label: 'Contas & BCs', href: '/business-centers', icon: <Building2 size={20} /> },
    { label: 'Pixels', href: '/pixels', icon: <Zap size={20} /> },
    { label: 'Tracking', href: '/manager', icon: <Crosshair size={20} /> },
    { label: 'Ranking', href: '/history', icon: <Trophy size={20} /> },
    { label: 'Integração', href: '/settings', icon: <Plug size={20} />, warning: !tiktokConnected },
    { label: 'API e Webhooks', href: '/accounts', icon: <Code size={20} /> },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-40 lg:hidden bg-[#2d1226] hover:bg-[#3d1a35] text-white p-2 rounded-lg transition-all shadow-lg"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen flex flex-col z-30 transition-transform duration-300 w-56',
          !sidebarOpen && '-translate-x-full lg:translate-x-0'
        )}
        style={{
          background: 'linear-gradient(180deg, #3d1228 0%, #2a0e1e 25%, #1a0a14 50%, #0f0a0d 100%)',
        }}
      >
        {/* Logo */}
        <div className="px-5 py-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center shadow-lg shadow-pink-500/20">
            <Zap size={18} className="text-white" />
          </div>
          <h1 className="font-bold text-lg text-white tracking-tight">ShadowAds</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-3">
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium',
                  isActive(item.href)
                    ? 'bg-pink-600/30 text-pink-300 border border-pink-500/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                )}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
              >
                <span className={cn(
                  isActive(item.href) ? 'text-pink-400' : 'text-gray-500'
                )}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.warning && (
                  <span className="ml-auto">
                    <AlertTriangle size={14} className="text-yellow-400" />
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Info */}
        <div className="px-4 py-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-white/10 rounded transition-all text-gray-500 hover:text-gray-300"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
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
