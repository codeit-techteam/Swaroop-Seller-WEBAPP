import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { isSampleAdminPush } from "@/lib/sample-admin-pushes";
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
      notifications: [],
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
        const kept = get().notifications.filter(
          (item) => !isSampleAdminPush(item),
        );
        const existing = new Set(kept.map((item) => item.id));
        const incoming = items.filter(
          (item) => !existing.has(item.id) && !isSampleAdminPush(item),
        );
        if (incoming.length === 0) {
          if (kept.length !== get().notifications.length)
            set({ notifications: kept });
          return 0;
        }
        set({ notifications: [...incoming, ...kept] });
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
