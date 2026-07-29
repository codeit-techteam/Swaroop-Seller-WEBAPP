export type MetricStatus = "optimal" | "warning" | "critical" | "healthy";

export type DateFilterPreset =
  "today" | "last_7_days" | "last_30_days" | "this_quarter" | "custom";

export type ChartTab = "revenue" | "settlement";

export type ChartType = "bar" | "line" | "area";

export type AlertSeverity = "critical" | "warning" | "low";

export type ExportFormat = "CSV" | "Excel" | "PDF";

export type PerformanceSortKey =
  "name" | "status" | "currentValue" | "target" | "trend";

export interface PerformanceKPI {
  id: string;
  title: string;
  value: number;
  displaySuffix?: string;
  displayPrefix?: string;
  maxValue?: number;
  decimals?: number;
  trend: number;
  trendUnit?: string;
  format?: "number" | "percent" | "score" | "duration";
}

export interface OperationalMetric {
  id: string;
  name: string;
  status: MetricStatus;
  currentValue: number;
  target: number;
  trend: number;
  unit: "%" | "min" | "score";
}

export interface ChartDataPoint {
  month: string;
  label: string;
  revenue: number;
  settlement: number;
  orders: number;
  dispatch: number;
  highlight?: boolean;
}

export interface InventoryAlert {
  id: string;
  product: string;
  grade?: string;
  remainingStock: number;
  unit: string;
  severity: AlertSeverity;
}

export interface TopProduct {
  id: string;
  rank: number;
  product: string;
  grade: string;
  soldQuantity: number;
  unit: string;
  progress: number;
}

export interface PerformanceReport {
  id: string;
  title: string;
  period: string;
  fileType: "PDF" | "XLSX" | "CSV";
  size: string;
  icon: "document" | "spreadsheet" | "shield";
}

export interface PerformanceNotification {
  id: string;
  title: string;
  message: string;
  type: "inventory" | "settlement" | "offer" | "dispatch";
  read: boolean;
  timestamp: string;
}

export interface PerformanceFilters {
  preset: DateFilterPreset;
  dateFrom: string;
  dateTo: string;
  metricSearch: string;
  metricStatus: MetricStatus | "all";
}

export interface RequestReportForm {
  reportType: string;
  dateFrom: string;
  dateTo: string;
  email: string;
  remarks?: string;
}

export interface PerformanceMetrics {
  kpis: PerformanceKPI[];
  operationalMetrics: OperationalMetric[];
  chartData: ChartDataPoint[];
  inventoryAlerts: InventoryAlert[];
  topProducts: TopProduct[];
  reports: PerformanceReport[];
}
