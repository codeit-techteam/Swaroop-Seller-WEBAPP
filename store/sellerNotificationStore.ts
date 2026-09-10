import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { sellerNotificationsMock } from "@/lib/mock/notifications";
import type { NotificationCategory, SellerNotification } from "@/types/seller";

interface SellerNotificationState {
  notifications: SellerNotification[];
  filter: "all" | "unread" | NotificationCategory;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setFilter: (filter: SellerNotificationState["filter"]) => void;
  ingestAdminPushes: (items: SellerNotification[]) => number;
  getFiltered: () => SellerNotification[];
  getUnreadCount: () => number;
}

export const useSellerNotificationStore = create<SellerNotificationState>()(
  devtools(
    (set, get) => ({
      notifications: sellerNotificationsMock,
      filter: "all",
      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((item) =>
            item.id === id ? { ...item, read: true } : item,
          ),
        })),
      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((item) => ({
            ...item,
            read: true,
          })),
        })),
      setFilter: (filter) => set({ filter }),
      ingestAdminPushes: (items) => {
        const existing = new Set(get().notifications.map((item) => item.id));
        const incoming = items.filter((item) => !existing.has(item.id));
        if (incoming.length === 0) return 0;
        set((state) => ({
          notifications: [...incoming, ...state.notifications],
        }));
        return incoming.length;
      },
      getFiltered: () => {
        const { notifications, filter } = get();
        if (filter === "all") return notifications;
        if (filter === "unread")
          return notifications.filter((item) => !item.read);
        return notifications.filter((item) => item.category === filter);
      },
      getUnreadCount: () =>
        get().notifications.filter((item) => !item.read).length,
    }),
    { name: "seller-notification-store" },
  ),
);
