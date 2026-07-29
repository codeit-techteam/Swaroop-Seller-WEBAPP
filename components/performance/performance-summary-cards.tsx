"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";

import { AnimatedNumber } from "@/components/erp/animated-number";
import { cn } from "@/lib/utils";
import type { PerformanceKPI } from "@/types/performance";

interface PerformanceMetricCardProps {
  kpi: PerformanceKPI;
  index?: number;
}

function formatKpiValue(kpi: PerformanceKPI): {
  value: number;
  prefix: string;
  suffix: string;
  decimals: number;
} {
  switch (kpi.format) {
    case "score":
      return {
        value: kpi.value,
        prefix: "",
        suffix: kpi.maxValue ? `/${kpi.maxValue}` : "",
        decimals: 0,
      };
    case "percent":
      return {
        value: kpi.value,
        prefix: "",
        suffix: "%",
        decimals: 1,
      };
    case "duration":
      return {
        value: kpi.value,
        prefix: "",
        suffix: "m",
        decimals: 0,
      };
    default:
      return {
        value: kpi.value,
        prefix: kpi.displayPrefix ?? "",
        suffix: kpi.displaySuffix ?? "",
        decimals: kpi.decimals ?? 0,
      };
  }
}

export function PerformanceMetricCard({
  kpi,
  index = 0,
}: PerformanceMetricCardProps) {
  const formatted = formatKpiValue(kpi);
  const isPositiveTrend =
    kpi.format === "duration" ? kpi.trend < 0 : kpi.trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(15,23,42,0.08)" }}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        {kpi.title}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        <AnimatedNumber
          value={formatted.value}
          decimals={formatted.decimals}
          prefix={formatted.prefix}
          suffix={formatted.suffix}
        />
      </p>
      <div
        className={cn(
          "mt-2 flex items-center gap-1 text-[11px] font-semibold",
          isPositiveTrend ? "text-[#1B6EF3]" : "text-red-500",
        )}
      >
        {isPositiveTrend ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span>
          {kpi.trend > 0 ? "+" : ""}
          {kpi.trend}
          {kpi.trendUnit ?? (kpi.format === "percent" ? "%" : "")}
        </span>
        <span className="font-normal text-slate-400">vs prev period</span>
      </div>
    </motion.div>
  );
}

interface PerformanceSummaryCardsProps {
  kpis: PerformanceKPI[];
}

export function PerformanceSummaryCards({
  kpis,
}: PerformanceSummaryCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi, index) => (
        <PerformanceMetricCard key={kpi.id} kpi={kpi} index={index} />
      ))}
    </div>
  );
}
