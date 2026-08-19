export interface AnalyticsKpi {
  id: string;
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

export interface AnalyticsSeriesPoint {
  month: string;
  revenue: number;
  orders: number;
  procurement: number;
  dispatch: number;
}
