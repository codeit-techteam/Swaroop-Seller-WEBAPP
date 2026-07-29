"use client";

import type { ChartDataPoint } from "@/types/performance";

import { RevenueSettlementChart } from "./revenue-settlement-chart";

interface RevenueChartProps {
  data: ChartDataPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <RevenueSettlementChart
      data={data}
      activeTab="revenue"
      chartType="bar"
      onTabChange={() => {}}
      onChartTypeChange={() => {}}
    />
  );
}
