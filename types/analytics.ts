export type RevenueFilterPeriod = "7d" | "30d" | "3m" | "1y";

export interface AnalyticsSummary {
  revenue: number;
  orders: number;
  conversionRate: number;
  averageOrderValue: number;
}

export interface OrderBreakdownItem {
  id: string;
  label: string;
  count: number;
  percentage: number;
}

export interface TopSellingProduct {
  id: string;
  name: string;
  orders: number;
  revenue: string;
  growthPercent: number;
}

export interface WarehouseAnalytics {
  id: string;
  name: string;
  availableStock: string;
  reserved: string;
  capacityPercent: number;
}

export interface AnalyticsActivity {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  type: "offer" | "inventory" | "order" | "dispatch" | "settlement";
}

/** Parity model with SWAROOP mobile SellerAnalyticsSnapshot. */
export interface SellerAnalyticsSnapshot {
  revenue: {
    today: string;
    monthly: string;
    filters: Record<RevenueFilterPeriod, number[]>;
  };
  orders: {
    completed: number;
    breakdown: OrderBreakdownItem[];
  };
  products: {
    active: number;
    topSelling: TopSellingProduct[];
  };
  inventory: {
    value: string;
    offersLive: number;
    conversionRate: string;
    customerRating: string;
  };
  settlement: {
    pending: string;
    released: string;
    tds: string;
    platformFees: string;
    netEarnings: string;
  };
  warehouses: WarehouseAnalytics[];
  shipments: {
    live: number;
    delayed: number;
    delivered: number;
    averageEta: string;
    averageTransitTime: string;
  };
  activities: AnalyticsActivity[];
}
