"use client";

import { motion } from "framer-motion";
import { Banknote, Clock, Percent, TrendingUp } from "lucide-react";

import { AnimatedNumber } from "@/components/erp/animated-number";
import { cn } from "@/lib/utils";
import type { SettlementSummary } from "@/types/settlements";

const cards: {
  key: keyof SettlementSummary;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  accentClassName: string;
  isCurrency?: boolean;
}[] = [
  {
    key: "grossRevenue",
    label: "Gross Revenue",
    icon: TrendingUp,
    iconClassName: "bg-blue-50 text-blue-600",
    accentClassName: "border-l-blue-500",
    isCurrency: true,
  },
  {
    key: "pendingSettlement",
    label: "Pending Settlement",
    icon: Clock,
    iconClassName: "bg-amber-50 text-amber-600",
    accentClassName: "border-l-amber-500",
    isCurrency: true,
  },
  {
    key: "settledAmount",
    label: "Settled Amount",
    icon: Banknote,
    iconClassName: "bg-emerald-50 text-emerald-600",
    accentClassName: "border-l-emerald-500",
    isCurrency: true,
  },
  {
    key: "commissionDeducted",
    label: "Commission Deducted",
    icon: Percent,
    iconClassName: "bg-violet-50 text-violet-600",
    accentClassName: "border-l-violet-500",
    isCurrency: true,
  },
];

interface SettlementSummaryCardsProps {
  summary: SettlementSummary;
  className?: string;
}

export function SettlementSummaryCards({
  summary,
  className,
}: SettlementSummaryCardsProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        const value = summary[card.key];
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            className={cn(
              "rounded-xl border border-slate-200 border-l-4 bg-white p-4 shadow-sm transition-shadow",
              card.accentClassName,
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
                  <AnimatedNumber
                    value={value}
                    decimals={0}
                    prefix={card.isCurrency ? "₹" : ""}
                  />
                </p>
              </div>
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  card.iconClassName,
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
