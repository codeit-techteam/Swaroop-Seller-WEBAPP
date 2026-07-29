"use client";

import type { ChartDataPoint } from "@/types/performance";

import { RevenueSettlementChart } from "./revenue-settlement-chart";

interface SettlementChartProps {
  data: ChartDataPoint[];
}

export function SettlementChart({ data }: SettlementChartProps) {
  return (
    <RevenueSettlementChart
      data={data}
      activeTab="settlement"
      chartType="bar"
      onTabChange={() => {}}
      onChartTypeChange={() => {}}
    />
  );
}
