import {
  endOfDay,
  endOfQuarter,
  format,
  startOfDay,
  startOfQuarter,
  subDays,
} from "date-fns";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  chartDataMock,
  globalSearchMock,
  inventoryAlertsMock,
  operationalMetricsMock,
  performanceKpisMock,
  performanceNotificationsMock,
  performanceReportsMock,
  topProductsMock,
} from "@/mock/performance";
import type {
  ChartDataPoint,
  ChartTab,
  ChartType,
  DateFilterPreset,
  ExportFormat,
  InventoryAlert,
  MetricStatus,
  OperationalMetric,
  PerformanceFilters,
  PerformanceKPI,
  PerformanceNotification,
  PerformanceReport,
  PerformanceSortKey,
  RequestReportForm,
  TopProduct,
} from "@/types/performance";

interface PerformanceState {
  kpis: PerformanceKPI[];
  operationalMetrics: OperationalMetric[];
  chartData: ChartDataPoint[];
  inventoryAlerts: InventoryAlert[];
  topProducts: TopProduct[];
  reports: PerformanceReport[];
  notifications: PerformanceNotification[];
  filters: PerformanceFilters;
  chartTab: ChartTab;
  chartType: ChartType;
  sortKey: PerformanceSortKey;
  sortDirection: "asc" | "desc";
  globalSearch: string;
  requestReportOpen: boolean;
  notificationOpen: boolean;
  loading: boolean;
  setDatePreset: (preset: DateFilterPreset) => void;
  setCustomDateRange: (from: string, to: string) => void;
  setMetricSearch: (search: string) => void;
  setMetricStatus: (status: MetricStatus | "all") => void;
  setSort: (key: PerformanceSortKey, direction?: "asc" | "desc") => void;
  setChartTab: (tab: ChartTab) => void;
  setChartType: (type: ChartType) => void;
  setGlobalSearch: (search: string) => void;
  setRequestReportOpen: (open: boolean) => void;
  setNotificationOpen: (open: boolean) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  downloadReport: (id: string) => void;
  exportData: (format: ExportFormat) => void;
  submitReportRequest: (form: RequestReportForm) => void;
  getFilteredMetrics: () => OperationalMetric[];
  getFilteredChartData: () => ChartDataPoint[];
  getAdjustedKpis: () => PerformanceKPI[];
  getSearchResults: () => typeof globalSearchMock;
  getUnreadCount: () => number;
  bootstrap: () => void;
}

const today = new Date("2023-08-31");

function getDateRangeForPreset(preset: DateFilterPreset): {
  from: string;
  to: string;
} {
  switch (preset) {
    case "today":
      return {
        from: format(startOfDay(today), "yyyy-MM-dd"),
        to: format(endOfDay(today), "yyyy-MM-dd"),
      };
    case "last_7_days":
      return {
        from: format(subDays(today, 6), "yyyy-MM-dd"),
        to: format(today, "yyyy-MM-dd"),
      };
    case "last_30_days":
      return {
        from: format(subDays(today, 29), "yyyy-MM-dd"),
        to: format(today, "yyyy-MM-dd"),
      };
    case "this_quarter":
      return {
        from: format(startOfQuarter(today), "yyyy-MM-dd"),
        to: format(endOfQuarter(today), "yyyy-MM-dd"),
      };
    default:
      return {
        from: format(subDays(today, 29), "yyyy-MM-dd"),
        to: format(today, "yyyy-MM-dd"),
      };
  }
}

const defaultRange = getDateRangeForPreset("last_30_days");

const defaultFilters: PerformanceFilters = {
  preset: "last_30_days",
  dateFrom: defaultRange.from,
  dateTo: defaultRange.to,
  metricSearch: "",
  metricStatus: "all",
};

function scaleValue(value: number, factor: number, decimals = 1): number {
  return Number((value * factor).toFixed(decimals));
}

function getDateScaleFactor(filters: PerformanceFilters): number {
  const from = new Date(filters.dateFrom);
  const to = new Date(filters.dateTo);
  const days = Math.max(
    1,
    Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );

  if (filters.preset === "today") return 0.92;
  if (filters.preset === "last_7_days") return 0.96;
  if (filters.preset === "this_quarter") return 1.02;
  if (days <= 7) return 0.95;
  if (days <= 14) return 0.97;
  return 1;
}

function filterChartByDateRange(
  data: ChartDataPoint[],
  filters: PerformanceFilters,
): ChartDataPoint[] {
  const from = filters.dateFrom.slice(0, 7);
  const to = filters.dateTo.slice(0, 7);
  const filtered = data.filter(
    (point) => point.month >= from && point.month <= to,
  );
  return filtered.length > 0 ? filtered : data.slice(-6);
}

export const usePerformanceStore = create<PerformanceState>()(
  devtools(
    (set, get) => ({
      kpis: performanceKpisMock,
      operationalMetrics: operationalMetricsMock,
      chartData: chartDataMock,
      inventoryAlerts: inventoryAlertsMock,
      topProducts: topProductsMock,
      reports: performanceReportsMock,
      notifications: performanceNotificationsMock,
      filters: defaultFilters,
      chartTab: "revenue",
      chartType: "bar",
      sortKey: "name",
      sortDirection: "asc",
      globalSearch: "",
      requestReportOpen: false,
      notificationOpen: false,
      loading: true,
      setDatePreset: (preset) => {
        const range =
          preset === "custom"
            ? { from: get().filters.dateFrom, to: get().filters.dateTo }
            : getDateRangeForPreset(preset);
        set({
          filters: {
            ...get().filters,
            preset,
            dateFrom: range.from,
            dateTo: range.to,
          },
          loading: true,
        });
        window.setTimeout(() => set({ loading: false }), 400);
      },
      setCustomDateRange: (from, to) => {
        set({
          filters: {
            ...get().filters,
            preset: "custom",
            dateFrom: from,
            dateTo: to,
          },
          loading: true,
        });
        window.setTimeout(() => set({ loading: false }), 400);
      },
      setMetricSearch: (search) =>
        set((state) => ({
          filters: { ...state.filters, metricSearch: search },
        })),
      setMetricStatus: (status) =>
        set((state) => ({
          filters: { ...state.filters, metricStatus: status },
        })),
      setSort: (key, direction) => {
        const current = get();
        const nextDirection =
          direction ??
          (current.sortKey === key && current.sortDirection === "asc"
            ? "desc"
            : "asc");
        set({ sortKey: key, sortDirection: nextDirection });
      },
      setChartTab: (tab) => set({ chartTab: tab }),
      setChartType: (type) => set({ chartType: type }),
      setGlobalSearch: (search) => set({ globalSearch: search }),
      setRequestReportOpen: (open) => set({ requestReportOpen: open }),
      setNotificationOpen: (open) => set({ notificationOpen: open }),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      downloadReport: (id) => {
        const report = get().reports.find((r) => r.id === id);
        if (report) {
          void id;
        }
      },
      exportData: (format) => {
        void format;
      },
      submitReportRequest: (form) => {
        void form;
        set({ requestReportOpen: false });
      },
      getFilteredMetrics: () => {
        const { operationalMetrics, filters, sortKey, sortDirection } = get();
        const query = filters.metricSearch.trim().toLowerCase();
        const factor = getDateScaleFactor(filters);

        const filtered = operationalMetrics
          .map((metric) => ({
            ...metric,
            currentValue: scaleValue(metric.currentValue, factor),
            trend: scaleValue(metric.trend, factor, 1),
          }))
          .filter((metric) => {
            const matchesSearch =
              !query || metric.name.toLowerCase().includes(query);
            const matchesStatus =
              filters.metricStatus === "all" ||
              metric.status === filters.metricStatus;
            return matchesSearch && matchesStatus;
          });

        return [...filtered].sort((a, b) => {
          let left: string | number = a[sortKey];
          let right: string | number = b[sortKey];
          if (sortKey === "name") {
            left = a.name;
            right = b.name;
          } else if (sortKey === "status") {
            left = a.status;
            right = b.status;
          }
          if (typeof left === "number" && typeof right === "number") {
            return sortDirection === "asc" ? left - right : right - left;
          }
          const cmp = String(left).localeCompare(String(right));
          return sortDirection === "asc" ? cmp : -cmp;
        });
      },
      getFilteredChartData: () => {
        const { chartData, filters } = get();
        const factor = getDateScaleFactor(filters);
        return filterChartByDateRange(chartData, filters).map((point) => ({
          ...point,
          revenue: scaleValue(point.revenue * 1.2, factor, 0),
          settlement: scaleValue(point.settlement * 1.2, factor, 0),
          orders: scaleValue(point.orders, factor, 0),
          dispatch: scaleValue(point.dispatch, factor, 0),
        }));
      },
      getAdjustedKpis: () => {
        const { kpis, filters } = get();
        const factor = getDateScaleFactor(filters);
        return kpis.map((kpi) => ({
          ...kpi,
          value: scaleValue(kpi.value, factor),
          trend: scaleValue(kpi.trend, factor, 1),
        }));
      },
      getSearchResults: () => {
        const query = get().globalSearch.trim().toLowerCase();
        if (!query) return [];
        return globalSearchMock.filter(
          (item) =>
            item.label.toLowerCase().includes(query) ||
            item.type.toLowerCase().includes(query),
        );
      },
      getUnreadCount: () => get().notifications.filter((n) => !n.read).length,
      bootstrap: () => {
        set({ loading: true });
        window.setTimeout(() => set({ loading: false }), 500);
      },
    }),
    { name: "performance-store" },
  ),
);
