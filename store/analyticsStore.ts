import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { sellerAnalyticsSnapshotMock } from "@/mock/analytics";
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
  bootstrap: () => void;
  setRevenuePeriod: (period: RevenueFilterPeriod) => void;
  refresh: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  devtools(
    (set, get) => ({
      summary: null,
      snapshot: null,
      revenuePeriod: "7d",
      isLoading: true,
      bootstrap: () => {
        if (get().snapshot) {
          set({ isLoading: false });
          return;
        }
        set({ isLoading: true });
        window.setTimeout(() => {
          set({
            snapshot: sellerAnalyticsSnapshotMock,
            summary: {
              revenue: 3.8,
              orders: sellerAnalyticsSnapshotMock.orders.completed,
              conversionRate: 5.4,
              averageOrderValue: 2.96,
            },
            isLoading: false,
          });
        }, 350);
      },
      setRevenuePeriod: (period) => set({ revenuePeriod: period }),
      refresh: () => {
        set({ isLoading: true });
        window.setTimeout(() => {
          const base = get().snapshot ?? sellerAnalyticsSnapshotMock;
          const jitter = 24 + Math.random() * 2;
          set({
            snapshot: {
              ...base,
              revenue: {
                ...base.revenue,
                today: `₹${jitter.toFixed(1)}L`,
              },
            },
            isLoading: false,
          });
        }, 500);
      },
    }),
    { name: "analytics-store" },
  ),
);
