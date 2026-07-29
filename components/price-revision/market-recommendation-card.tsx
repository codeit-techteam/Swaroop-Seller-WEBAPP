"use client";

import { TrendingDown } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import type { MarketRecommendation } from "@/types/price-revision";

interface MarketRecommendationCardProps {
  recommendation: MarketRecommendation;
}

export function MarketRecommendationCard({
  recommendation,
}: MarketRecommendationCardProps) {
  const range = `${formatCurrency(recommendation.priceMin, { currency: "INR" }).replace(/\.00$/, "")}–${formatCurrency(recommendation.priceMax, { currency: "INR" }).replace(/\.00$/, "")} / MT`;

  return (
    <div className="space-y-3">
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Market Recommendation
      </h4>
      <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <TrendingDown className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">
              Recommended Price Range
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">
              {range}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-600">
          {recommendation.explanation}
        </p>
        <ul className="mt-3 space-y-1.5">
          {recommendation.factors.map((factor) => (
            <li
              key={factor}
              className="flex items-start gap-2 text-xs text-slate-600"
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
              {factor}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
