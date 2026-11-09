import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  emptySellerAnalyticsSnapshot,
  loadSellerAnalyticsFromApi,
} from "@/services/seller-analytics";
import type {
  AnalyticsSummary,
  RevenueFilterPeriod,
  SellerAnalyticsSnapshot,
} from "@/types/analytics";

interface AnalyticsState {
  summary: AnalyticsSummary | null;
  snapshot: SellerAnalyticsSnapshot | null;
  revenuePeriod: RevenueFilterPeriod;
  isLoading: boolean;
  isEmpty: boolean;
  loadError: string | null;
  bootstrap: () => Promise<void>;
  setRevenuePeriod: (period: RevenueFilterPeriod) => void;
  refresh: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  devtools(
    (set, get) => ({
      summary: null,
      snapshot: null,
      revenuePeriod: "7d",
      isLoading: true,
      isEmpty: false,
      loadError: null,
      bootstrap: async () => {
        if (get().snapshot && !get().loadError) {
          set({ isLoading: false });
          return;
        }
        set({ isLoading: true, loadError: null });
        try {
          const loaded = await loadSellerAnalyticsFromApi();
          set({
            snapshot: loaded.snapshot,
            summary: loaded.summary,
            isEmpty: loaded.isEmpty,
            loadError: loaded.loadError,
            isLoading: false,
          });
        } catch {
          set({
            snapshot: emptySellerAnalyticsSnapshot(),
            summary: {
              revenue: 0,
              orders: 0,
              conversionRate: 0,
              averageOrderValue: 0,
            },
            isEmpty: true,
            loadError: "Unable to load analytics. Showing empty metrics.",
            isLoading: false,
          });
        }
      },
      setRevenuePeriod: (period) => set({ revenuePeriod: period }),
      refresh: async () => {
        set({ isLoading: true, loadError: null });
        try {
          const loaded = await loadSellerAnalyticsFromApi();
          set({
            snapshot: loaded.snapshot,
            summary: loaded.summary,
            isEmpty: loaded.isEmpty,
            loadError: loaded.loadError,
            isLoading: false,
          });
        } catch {
          set({
            isLoading: false,
            loadError: "Refresh failed. Try again in a moment.",
          });
        }
      },
    }),
    { name: "analytics-store" },
  ),
);
