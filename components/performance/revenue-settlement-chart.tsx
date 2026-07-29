"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/common/empty-state";
import { cn } from "@/lib/utils";
import type { ChartDataPoint, ChartTab, ChartType } from "@/types/performance";

interface RevenueSettlementChartProps {
  data: ChartDataPoint[];
  activeTab: ChartTab;
  chartType: ChartType;
  onTabChange: (tab: ChartTab) => void;
  onChartTypeChange: (type: ChartType) => void;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-semibold text-slate-700">{label}</p>
      {payload.map((entry) => (
        <p
          key={entry.dataKey}
          className="text-xs text-slate-600"
          style={{ color: entry.color }}
        >
          {entry.dataKey}: {entry.value} Cr
        </p>
      ))}
    </div>
  );
}

function MonthlyPerformanceTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
    name: string;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
      <p className="mb-1 text-xs font-semibold text-slate-700">{label}</p>
      {payload.map((entry) => (
        <p
          key={entry.dataKey}
          className="text-xs"
          style={{ color: entry.color }}
        >
          {entry.name}: {entry.value}
          {entry.dataKey === "revenue" || entry.dataKey === "settlement"
            ? " Cr"
            : ""}
        </p>
      ))}
    </div>
  );
}

export function RevenueSettlementChart({
  data,
  activeTab,
  chartType,
  onTabChange,
  onChartTypeChange,
}: RevenueSettlementChartProps) {
  const dataKey = activeTab === "revenue" ? "revenue" : "settlement";
  const chartData = data.map((d) => ({
    ...d,
    value: d[dataKey],
  }));

  if (data.length === 0) {
    return (
      <EmptyState
        title="No revenue data"
        description="No chart data available for the selected date range."
      />
    );
  }

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 8, right: 8, left: -20, bottom: 0 },
    };

    if (chartType === "line") {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E2E8F0"
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#1B6EF3"
            strokeWidth={2}
            dot={false}
            animationDuration={800}
          />
        </LineChart>
      );
    }

    if (chartType === "area") {
      return (
        <AreaChart {...commonProps}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E2E8F0"
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#1B6EF3"
            fill="#1B6EF3"
            fillOpacity={0.15}
            animationDuration={800}
          />
        </AreaChart>
      );
    }

    return (
      <BarChart {...commonProps} barCategoryGap="20%">
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#E2E8F0"
        />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "#94A3B8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="value"
          radius={[4, 4, 0, 0]}
          animationDuration={800}
          shape={(props: {
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            payload?: ChartDataPoint;
          }) => {
            const { x = 0, y = 0, width = 0, height = 0, payload } = props;
            const fill = payload?.highlight ? "#1B6EF3" : "#93C5FD";
            return (
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={fill}
                rx={4}
              />
            );
          }}
        />
      </BarChart>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">
          Revenue & Settlement Trends
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 p-0.5">
            {(["revenue", "settlement"] as ChartTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange(tab)}
                className={cn(
                  "rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors",
                  activeTab === tab
                    ? "bg-[#0B1F3A] text-white"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="hidden rounded-lg border border-slate-200 p-0.5 sm:flex">
            {(["bar", "line", "area"] as ChartType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChartTypeChange(type)}
                className={cn(
                  "rounded-md px-2 py-1 text-[10px] font-semibold uppercase transition-colors",
                  chartType === type
                    ? "bg-[#E8F1FF] text-[#1B6EF3]"
                    : "text-slate-400 hover:text-slate-600",
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export function MonthlyPerformanceChart({ data }: { data: ChartDataPoint[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        title="No performance data"
        description="No monthly data available for the selected date range."
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">
          Monthly Performance
        </h2>
        <div className="flex flex-wrap gap-3 text-[10px] font-semibold uppercase">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-[#1B6EF3]" />
            Revenue
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-[#10B981]" />
            Orders
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
            Settlement
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-[#8B5CF6]" />
            Dispatch
          </span>
        </div>
      </div>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E2E8F0"
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<MonthlyPerformanceTooltip />} />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#1B6EF3"
              strokeWidth={2}
              dot={false}
              animationDuration={800}
            />
            <Line
              type="monotone"
              dataKey="orders"
              name="Orders"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              animationDuration={800}
            />
            <Line
              type="monotone"
              dataKey="settlement"
              name="Settlement"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={false}
              animationDuration={800}
            />
            <Line
              type="monotone"
              dataKey="dispatch"
              name="Dispatch"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={false}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export { RevenueChart } from "./revenue-chart";
export { SettlementChart } from "./settlement-chart";
