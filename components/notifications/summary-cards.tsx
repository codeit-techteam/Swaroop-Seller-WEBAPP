"use client";

import { motion } from "framer-motion";

import { AnimatedNumber } from "@/components/erp/animated-number";
import { cn } from "@/lib/utils";
import type { NotificationSummary } from "@/types/notifications";

const cards: {
  key: keyof NotificationSummary;
  label: string;
  highlight?: boolean;
}[] = [
  { key: "newPurchaseRequests", label: "New Purchase Requests" },
  { key: "complianceAlerts", label: "Compliance Alerts", highlight: true },
  { key: "dispatchUpdates", label: "Dispatch Updates" },
  { key: "settlementUpdates", label: "Settlement Updates" },
];

interface SummaryCardsProps {
  summary: NotificationSummary;
  className?: string;
}

export function SummaryCards({ summary, className }: SummaryCardsProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {cards.map((card, index) => {
        const value = summary[card.key];
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ y: -2 }}
            className={cn(
              "rounded-xl border bg-white p-4 shadow-sm",
              card.highlight ? "border-red-300" : "border-slate-200",
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              {card.label}
            </p>
            <p
              className={cn(
                "mt-2 text-2xl font-bold tabular-nums tracking-tight",
                card.highlight ? "text-red-600" : "text-slate-900",
              )}
            >
              <AnimatedNumber value={value} prefix={value < 10 ? "0" : ""} />
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
