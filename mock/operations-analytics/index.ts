import type {
  AnalyticsKpi,
  AnalyticsSeriesPoint,
} from "@/types/operations-analytics";

export const analyticsKpisMock: AnalyticsKpi[] = [
  {
    id: "rev",
    label: "Revenue Growth",
    value: "₹18.4 Cr",
    change: "+8.6%",
    positive: true,
  },
  {
    id: "ord",
    label: "Order Volume",
    value: "246",
    change: "+12.1%",
    positive: true,
  },
  {
    id: "proc",
    label: "Procurement Volume",
    value: "3,120 MT",
    change: "+4.2%",
    positive: true,
  },
  {
    id: "inv",
    label: "Inventory Movement",
    value: "1,840 MT",
    change: "-3.4%",
    positive: false,
  },
  {
    id: "credit",
    label: "Credit Exposure",
    value: "₹3.1 Cr",
    change: "+1.8%",
    positive: false,
  },
  {
    id: "conv",
    label: "Offer Conversion",
    value: "34%",
    change: "+2.4%",
    positive: true,
  },
  {
    id: "disp",
    label: "Dispatch Performance",
    value: "92%",
    change: "+1.1%",
    positive: true,
  },
];

export const analyticsSeriesMock: AnalyticsSeriesPoint[] = [
  { month: "Dec", revenue: 12.1, orders: 168, procurement: 2100, dispatch: 86 },
  { month: "Jan", revenue: 13.4, orders: 181, procurement: 2280, dispatch: 88 },
  { month: "Feb", revenue: 14.8, orders: 196, procurement: 2410, dispatch: 89 },
  { month: "Mar", revenue: 15.6, orders: 210, procurement: 2550, dispatch: 90 },
  { month: "Apr", revenue: 16.9, orders: 228, procurement: 2710, dispatch: 91 },
  { month: "May", revenue: 18.4, orders: 246, procurement: 3120, dispatch: 92 },
];
