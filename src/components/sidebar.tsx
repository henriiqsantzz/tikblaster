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
  Zap,
  Sliders,
  BarChart3,
  LogOut,
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
          setUserName(user.email?.split('@')[0] || 'User');
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
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Campanhas', href: '/campaigns', icon: <Megaphone size={18} /> },
    { label: 'Contas & BCs', href: '/business-centers', icon: <Building2 size={18} /> },
    { label: 'Pixels', href: '/pixels', icon: <Zap size={18} /> },
    { label: 'Tracking', href: '/manager', icon: <Crosshair size={18} /> },
    { label: 'Ranking', href: '/history', icon: <BarChart3 size={18} /> },
    { label: 'Integração', href: '/integrations', icon: <Sliders size={18} /> },
    { label: 'API e Webhooks', href: '/accounts', icon: <Code size={18} /> },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-40 lg:hidden bg-wine-900 text-white p-2 rounded-lg"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen flex flex-col z-30 transition-transform duration-200 w-[200px] bg-gradient-sidebar',
          !sidebarOpen && '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="px-5 h-14 flex items-center gap-2.5">
          <div className="w-7 h-7 bg-accent-500 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-[15px] text-white">ShadowAds</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-3">
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all',
                  isActive(item.href)
                    ? 'bg-accent-500 text-white'
                    : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
                )}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Settings + User */}
        <div className="px-3 py-3 border-t border-sidebar-border">
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all mb-2',
              isActive('/settings')
                ? 'bg-accent-500 text-white'
                : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
            )}
          >
            <Settings size={18} />
            <span>Configurações</span>
          </Link>
          <div className="flex items-center gap-2.5 px-3 py-1">
            <div className="w-7 h-7 rounded-full bg-accent-500/30 border border-accent-500/40 flex items-center justify-center text-xs font-bold text-accent-300">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-sidebar-text truncate">{userName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 rounded-md text-sidebar-text hover:text-white hover:bg-sidebar-hover transition-colors"
              title="Sair"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
