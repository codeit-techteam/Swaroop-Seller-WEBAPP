import { apiClient } from "@/services/apiClient";
import {
  fetchSellerOfferSummary,
  fetchSellerOrderSummary,
} from "@/services/commerce";
import { fetchSellerSettlementSummary } from "@/services/settlements";
import type {
  RevenueFilterPeriod,
  SellerAnalyticsSnapshot,
} from "@/types/analytics";

type Envelope<T> = { success?: boolean; data: T };

type DashboardSummary = {
  products?: { active?: number };
  activeOffers?: number;
  offers?: { active?: number };
};

const num = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const inr = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) return "₹0";
  if (value >= 1_00_00_000) {
    return `₹${(value / 1_00_00_000).toFixed(2)}Cr`;
  }
  if (value >= 1_00_000) {
    return `₹${(value / 1_00_000).toFixed(1)}L`;
  }
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
};

const zeroSeries = (period: RevenueFilterPeriod): number[] => {
  const lengths: Record<RevenueFilterPeriod, number> = {
    "7d": 7,
    "30d": 30,
    "3m": 12,
    "1y": 12,
  };
  return Array.from({ length: lengths[period] }, () => 0);
};

export function emptySellerAnalyticsSnapshot(): SellerAnalyticsSnapshot {
  const filters = {
    "7d": zeroSeries("7d"),
    "30d": zeroSeries("30d"),
    "3m": zeroSeries("3m"),
    "1y": zeroSeries("1y"),
  };
  return {
    revenue: { today: "₹0", monthly: "₹0", filters },
    orders: { completed: 0, breakdown: [] },
    products: { active: 0, topSelling: [] },
    inventory: {
      value: "₹0",
      offersLive: 0,
      conversionRate: "0%",
      customerRating: "—",
    },
    settlement: {
      pending: "₹0",
      released: "₹0",
      tds: "₹0",
      platformFees: "₹0",
      netEarnings: "₹0",
    },
    warehouses: [],
    shipments: {
      live: 0,
      delayed: 0,
      delivered: 0,
      averageEta: "—",
      averageTransitTime: "—",
    },
    activities: [],
  };
}

async function fetchDashboardSummary(): Promise<DashboardSummary | null> {
  try {
    const response = await apiClient.get<Envelope<DashboardSummary>>(
      "/seller/dashboard/summary",
    );
    return response.data.data ?? null;
  } catch {
    return null;
  }
}

export type SellerAnalyticsLoadResult = {
  snapshot: SellerAnalyticsSnapshot;
  summary: {
    revenue: number;
    orders: number;
    conversionRate: number;
    averageOrderValue: number;
  };
  isEmpty: boolean;
  loadError: string | null;
};

export async function loadSellerAnalyticsFromApi(): Promise<SellerAnalyticsLoadResult> {
  const base = emptySellerAnalyticsSnapshot();
  let loadError: string | null = null;

  const [dashboard, orders, offers, settlement] = await Promise.all([
    fetchDashboardSummary(),
    fetchSellerOrderSummary().catch(() => null),
    fetchSellerOfferSummary().catch(() => null),
    fetchSellerSettlementSummary().catch(() => null),
  ]);

  if (!dashboard && !orders && !offers && !settlement) {
    loadError = "Unable to load analytics from the server.";
  }

  const delivered = orders?.delivered ?? 0;
  const activeProducts = num(dashboard?.products?.active);
  const offersLive = num(
    dashboard?.activeOffers ?? dashboard?.offers?.active ?? offers?.active,
  );

  const settled = num(settlement?.settledAmount);
  const pending = num(settlement?.pendingSettlementAmount);
  const totalSales = num(settlement?.totalSales);

  const snapshot: SellerAnalyticsSnapshot = {
    ...base,
    orders: {
      completed: delivered,
      breakdown:
        delivered > 0 || (orders?.total ?? 0) > 0
          ? [
              {
                id: "delivered",
                label: "Delivered",
                count: delivered,
                percentage: orders?.total
                  ? Math.round((delivered / orders.total) * 100)
                  : 0,
              },
              {
                id: "in-progress",
                label: "In progress",
                count: num(orders?.processing) + num(orders?.dispatched),
                percentage: 0,
              },
            ]
          : [],
    },
    products: { ...base.products, active: activeProducts },
    inventory: {
      ...base.inventory,
      offersLive,
      conversionRate: delivered > 0 && offersLive > 0 ? "—" : "0%",
    },
    settlement: {
      pending: inr(pending),
      released: inr(settled),
      tds: "₹0",
      platformFees: "₹0",
      netEarnings: inr(Math.max(0, settled - pending)),
    },
    revenue: {
      today: "₹0",
      monthly: inr(totalSales),
      filters: base.revenue.filters,
    },
  };

  const isEmpty =
    delivered === 0 &&
    totalSales <= 0 &&
    settled <= 0 &&
    pending <= 0 &&
    offersLive === 0 &&
    activeProducts === 0;

  return {
    snapshot,
    summary: {
      revenue: totalSales > 0 ? totalSales / 1_00_00_000 : 0,
      orders: delivered,
      conversionRate: 0,
      averageOrderValue: 0,
    },
    isEmpty,
    loadError,
  };
}
