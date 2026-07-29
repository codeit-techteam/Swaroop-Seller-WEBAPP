import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  notificationsMock,
  notificationsSummaryMock,
} from "@/mock/notifications";
import type {
  Notification,
  NotificationFilters,
  NotificationSummary,
} from "@/types/notifications";

const defaultFilters: NotificationFilters = {
  datePreset: "Last 7 Days",
  category: "All Categories",
  priority: "High",
  readStatus: "All",
};

interface NotificationState {
  notifications: Notification[];
  selectedNotification: Notification | null;
  filters: NotificationFilters;
  search: string;
  drawerOpen: boolean;
  loading: boolean;
  visibleCount: number;
  pageSize: number;

  bootstrap: () => void;
  setSearch: (search: string) => void;
  setFilter: <K extends keyof NotificationFilters>(
    key: K,
    value: NotificationFilters[K],
  ) => void;
  clearFilters: () => void;
  openDrawer: (notification: Notification) => void;
  closeDrawer: () => void;
  selectNotification: (notification: Notification | null) => void;
  markRead: (id: string) => void;
  markUnread: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  archiveNotification: (id: string) => void;
  pinNotification: (id: string) => void;
  clearAll: () => void;
  loadMore: () => void;
  exportNotifications: (format: "PDF" | "Excel" | "CSV") => void;
  getFilteredNotifications: () => Notification[];
  getVisibleNotifications: () => Notification[];
  getSummary: () => NotificationSummary;
  getUnreadCount: () => number;
  hasActiveFilters: () => boolean;
}

function isWithinDatePreset(
  createdAt: string,
  preset: NotificationFilters["datePreset"],
) {
  const date = new Date(createdAt);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  switch (preset) {
    case "Today":
      return date >= startOfToday;
    case "Last 7 Days": {
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= cutoff;
    }
    case "Last 30 Days": {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return date >= cutoff;
    }
    default:
      return true;
  }
}

function sortNotifications(items: Notification[]) {
  return [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      notifications: notificationsMock,
      selectedNotification: null,
      filters: defaultFilters,
      search: "",
      drawerOpen: false,
      loading: false,
      visibleCount: 10,
      pageSize: 10,

      bootstrap: () => {
        set({ loading: true, visibleCount: 10 });
        window.setTimeout(() => {
          set({
            notifications: notificationsMock,
            loading: false,
          });
        }, 600);
      },

      setSearch: (search) => set({ search, visibleCount: 10 }),

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
          visibleCount: 10,
        })),

      clearFilters: () =>
        set({
          filters: defaultFilters,
          search: "",
          visibleCount: 10,
        }),

      openDrawer: (notification) => {
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === notification.id ? { ...n, read: true } : n,
          );
          const selected = updated.find((n) => n.id === notification.id) ?? {
            ...notification,
            read: true,
          };
          return {
            notifications: updated,
            selectedNotification: selected,
            drawerOpen: true,
          };
        });
      },

      closeDrawer: () =>
        set({
          drawerOpen: false,
          selectedNotification: null,
        }),

      selectNotification: (notification) =>
        set({ selectedNotification: notification }),

      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
          selectedNotification:
            state.selectedNotification?.id === id
              ? { ...state.selectedNotification, read: true }
              : state.selectedNotification,
        })),

      markUnread: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: false } : n,
          ),
          selectedNotification:
            state.selectedNotification?.id === id
              ? { ...state.selectedNotification, read: false }
              : state.selectedNotification,
        })),

      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          selectedNotification: state.selectedNotification
            ? { ...state.selectedNotification, read: true }
            : null,
        })),

      deleteNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
          selectedNotification:
            state.selectedNotification?.id === id
              ? null
              : state.selectedNotification,
          drawerOpen:
            state.selectedNotification?.id === id ? false : state.drawerOpen,
        })),

      archiveNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, archived: true, read: true } : n,
          ),
          selectedNotification:
            state.selectedNotification?.id === id
              ? { ...state.selectedNotification, archived: true, read: true }
              : state.selectedNotification,
        })),

      pinNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, pinned: !n.pinned } : n,
          ),
          selectedNotification:
            state.selectedNotification?.id === id
              ? {
                  ...state.selectedNotification,
                  pinned: !state.selectedNotification.pinned,
                }
              : state.selectedNotification,
        })),

      clearAll: () =>
        set({
          notifications: [],
          selectedNotification: null,
          drawerOpen: false,
          visibleCount: 10,
        }),

      loadMore: () =>
        set((state) => ({
          visibleCount: state.visibleCount + state.pageSize,
        })),

      exportNotifications: () => {
        /* handled in UI with toast */
      },

      getFilteredNotifications: () => {
        const { notifications, filters, search } = get();
        const query = search.trim().toLowerCase();

        return sortNotifications(
          notifications.filter((notification) => {
            if (notification.archived) return false;
            if (
              !isWithinDatePreset(notification.createdAt, filters.datePreset)
            ) {
              return false;
            }
            if (
              filters.category !== "All Categories" &&
              notification.category !== filters.category
            ) {
              return false;
            }
            if (
              filters.priority !== "All Priorities" &&
              notification.priority !== filters.priority
            ) {
              return false;
            }
            if (filters.readStatus === "Unread" && notification.read)
              return false;
            if (filters.readStatus === "Read" && !notification.read)
              return false;
            if (!query) return true;

            return (
              notification.title.toLowerCase().includes(query) ||
              notification.description.toLowerCase().includes(query) ||
              notification.referenceNumber.toLowerCase().includes(query) ||
              notification.category.toLowerCase().includes(query)
            );
          }),
        );
      },

      getVisibleNotifications: () => {
        const filtered = get().getFilteredNotifications();
        return filtered.slice(0, get().visibleCount);
      },

      getSummary: () => {
        const active = get().notifications.filter((n) => !n.archived);
        const unread = active.filter((n) => !n.read);

        return {
          newPurchaseRequests: unread.filter(
            (n) => n.category === "Purchase Request",
          ).length,
          priceRevisions: unread.filter(
            (n) => n.category === "Offer Changes Requested",
          ).length,
          complianceAlerts: unread.filter(
            (n) =>
              n.category === "Compliance Alert" ||
              n.category === "Document Expiring",
          ).length,
          dispatchUpdates: unread.filter(
            (n) =>
              n.category === "Dispatch Scheduled" ||
              n.category === "Shipment Delayed",
          ).length,
          settlementUpdates: unread.filter(
            (n) => n.category === "Settlement Released",
          ).length,
        };
      },

      getUnreadCount: () =>
        get().notifications.filter((n) => !n.read && !n.archived).length,

      hasActiveFilters: () => {
        const { filters, search } = get();
        return (
          Boolean(search.trim()) ||
          filters.datePreset !== defaultFilters.datePreset ||
          filters.category !== defaultFilters.category ||
          filters.priority !== defaultFilters.priority ||
          filters.readStatus !== defaultFilters.readStatus
        );
      },
    }),
    { name: "notification-store" },
  ),
);

// Seed summary counts for initial reference (used if needed elsewhere)
export const initialNotificationSummary = notificationsSummaryMock;
