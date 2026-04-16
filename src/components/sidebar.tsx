'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const Sidebar = () => {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const [bcOpen, setBcOpen] = useState(true);

  const mainNavItems: NavSection[] = [
    {
      title: 'Principal',
      items: [
        {
          label: 'Dashboard',
          href: '/dashboard',
          icon: <LayoutDashboard size={20} />,
        },
        {
          label: 'Business Centers',
          href: '/business-centers',
          icon: <Building2 size={20} />,
        },
        {
          label: 'Campanhas',
          href: '/campaigns',
          icon: <Megaphone size={20} />,
        },
        {
          label: 'Gerenciador',
          href: '/manager',
          icon: <BarChart3 size={20} />,
        },
        {
          label: 'Histórico',
          href: '/history',
          icon: <History size={20} />,
        },
      ],
    },
    {
      title: 'Operação',
      items: [
        {
          label: 'Criação de Contas',
          href: '/accounts',
          icon: <Smartphone size={20} />,
        },
        {
          label: 'Pixels',
          href: '/pixels',
          icon: <Zap size={20} />,
        },
      ],
    },
    {
      title: 'Sistema',
      items: [
        {
          label: 'Integrações',
          href: '/integrations',
          icon: <Sliders size={20} />,
        },
        {
          label: 'Configurações',
          href: '/settings',
          icon: <Settings size={20} />,
        },
      ],
    },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Toggle button for mobile */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-40 lg:hidden bg-dark-300 hover:bg-dark-200 text-gray-200 p-2 rounded-lg transition-all"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
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
          <button
            onClick={() => setBcOpen(!bcOpen)}
            className="w-full px-3 py-2 rounded-lg bg-dark-200 hover:bg-dark-100 border border-dark-100 flex items-center justify-between text-sm text-gray-200 transition-all"
          >
            <span className="font-medium">Selecionar BC</span>
            <ChevronDown
              size={16}
              className={cn('transition-transform', bcOpen ? 'rotate-180' : '')}
            />
          </button>
          {bcOpen && (
            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
              <div className="px-3 py-2 rounded bg-dark-100 text-xs text-brand-400 border border-brand-900">
                BC-2024-001
              </div>
            </div>
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
                      if (window.innerWidth < 1024) {
                        toggleSidebar();
                      }
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
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
              J
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-100 truncate">João Silva</p>
              <p className="text-xs text-gray-500 truncate">admin@tikblaster.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
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
