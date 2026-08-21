"use client";

import { motion } from "framer-motion";
import { BadgeIndianRupee, TrendingDown, Wallet } from "lucide-react";

import { formatCurrency, formatNumber } from "@/lib/utils";
import type { LivePricingStats } from "@/types/offers";

interface LivePriceCalculatorProps {
  stats: LivePricingStats;
  allocationMt: number;
  basePrice: number;
}

export function LivePriceCalculator({
  stats,
  allocationMt,
  basePrice,
}: LivePriceCalculatorProps) {
  return (
    <motion.div
      layout
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
    >
      <h3 className="mb-4 border-b border-slate-100 pb-4 text-sm font-semibold text-slate-900">
        Live Price Calculator
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Unit Price
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {basePrice > 0 ? formatCurrency(basePrice) : "—"}
          </p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5">
          <div className="flex items-center gap-1">
            <TrendingDown className="h-3 w-3 text-emerald-600" />
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Max Discount
            </p>
          </div>
          <p className="mt-1 text-lg font-bold text-emerald-600">
            {formatNumber(stats.maxDiscount, {
              maximumFractionDigits: 1,
            })}
            %
          </p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5">
          <div className="flex items-center gap-1">
            <BadgeIndianRupee className="h-3 w-3 text-[#1B6EF3]" />
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Buyer Visible Price
            </p>
          </div>
          <p className="mt-1 text-lg font-bold text-[#1B6EF3]">
            {stats.buyerVisiblePrice > 0
              ? formatCurrency(stats.buyerVisiblePrice)
              : "—"}
          </p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5">
          <div className="flex items-center gap-1">
            <Wallet className="h-3 w-3 text-slate-500" />
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Est. Revenue ({allocationMt || 0} MT)
            </p>
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {stats.estimatedRevenue > 0
              ? formatCurrency(stats.estimatedRevenue)
              : "—"}
          </p>
        </div>
      </div>
      {stats.totalSavings > 0 ? (
        <p className="mt-4 text-xs text-emerald-600">
          Total buyer savings at max tier: {formatCurrency(stats.totalSavings)}
        </p>
      ) : null}
    </motion.div>
  );
}
