'use client';

import React, { useState } from 'react';
import { Bell, Calendar } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';

const TopBar = () => {
  const { unreadCount, notifications, markAllRead } = useAppStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dateRange, setDateRange] = useState('today');

  const dateRanges = [
    { value: 'today', label: 'Hoje' },
    { value: '3days', label: '3 Dias' },
    { value: '7days', label: '7 Dias' },
    { value: '30days', label: '30 Dias' },
  ];

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-dark-300 border-b border-dark-100 flex items-center justify-between px-6 z-20 lg:pl-80">
      {/* Left: Date */}
      <div className="text-sm text-gray-400 capitalize hidden md:block">
        {today}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Date Range Selector */}
        <div className="flex items-center gap-2 bg-dark-200 rounded-lg p-1 border border-dark-100">
          {dateRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setDateRange(range.value)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded transition-all',
                dateRange === range.value
                  ? 'bg-brand-500 text-dark-500'
                  : 'text-gray-300 hover:text-gray-100'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-gray-300 hover:text-gray-100 hover:bg-dark-200 rounded-lg transition-all"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {Math.min(unreadCount, 9)}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-dark-300 border border-dark-100 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
              <div className="sticky top-0 bg-dark-300 border-b border-dark-100 px-4 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-100">Notificações</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-brand-400 hover:text-brand-300 font-medium"
                  >
                    Marcar como lido
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="divide-y divide-dark-100">
                  {notifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        'px-4 py-3 hover:bg-dark-200 transition-all cursor-pointer',
                        !notif.read && 'bg-dark-200'
                      )}
                    >
                      <p className="font-medium text-sm text-gray-100">
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        {new Date(notif.created_at).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {notifications.length > 5 && (
                <div className="px-4 py-2 text-center border-t border-dark-100">
                  <a href="#" className="text-xs text-brand-400 hover:text-brand-300">
                    Ver todas as notificações
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
