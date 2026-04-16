import { create } from 'zustand';
import type { TikTokBusinessCenter, TikTokAdvertiser, AppNotification } from '@/types';

interface AppState {
  // Business Center
  activeBC: TikTokBusinessCenter | null;
  businessCenters: TikTokBusinessCenter[];
  setActiveBC: (bc: TikTokBusinessCenter | null) => void;
  setBusinessCenters: (bcs: TikTokBusinessCenter[]) => void;

  // Advertisers
  advertisers: TikTokAdvertiser[];
  setAdvertisers: (advertisers: TikTokAdvertiser[]) => void;

  // Notifications
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: AppNotification) => void;
  setNotifications: (notifications: AppNotification[]) => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;

  // UI
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  dateRange: string;
  setDateRange: (range: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Business Center
  activeBC: null,
  businessCenters: [],
  setActiveBC: (bc) => set({ activeBC: bc }),
  setBusinessCenters: (bcs) => set({ businessCenters: bcs }),

  // Advertisers
  advertisers: [],
  setAdvertisers: (advertisers) => set({ advertisers }),

  // Notifications
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  // UI
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  dateRange: 'today',
  setDateRange: (range) => set({ dateRange: range }),
}));
