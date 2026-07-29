"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock3, Inbox, Truck } from "lucide-react";

import { AnimatedNumber } from "@/components/erp/animated-number";
import { cn } from "@/lib/utils";
import type { PurchaseRequestSummary } from "@/types/purchase-requests";

const cards: {
  key: keyof PurchaseRequestSummary;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  valueClassName?: string;
  pad?: boolean;
}[] = [
  {
    key: "newRequests",
    label: "New Requests",
    icon: Inbox,
    iconClassName: "bg-blue-50 text-[#1B6EF3]",
  },
  {
    key: "awaitingResponse",
    label: "Awaiting Response",
    icon: Clock3,
    iconClassName: "bg-amber-50 text-amber-600",
    pad: true,
  },
  {
    key: "acceptedToday",
    label: "Accepted Today",
    icon: CheckCircle2,
    iconClassName: "bg-emerald-50 text-emerald-600",
    pad: true,
  },
  {
    key: "dispatchPending",
    label: "Dispatch Pending",
    icon: Truck,
    iconClassName: "bg-violet-50 text-violet-600",
    pad: true,
  },
];

interface PurchaseSummaryCardsProps {
  summary: PurchaseRequestSummary;
  className?: string;
}

export function PurchaseSummaryCards({
  summary,
  className,
}: PurchaseSummaryCardsProps) {
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
            transition={{ delay: index * 0.06, duration: 0.35 }}
            whileHover={{ y: -2 }}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>
                <p
                  className={cn(
                    "mt-2 text-3xl font-bold tabular-nums text-slate-900",
                    card.valueClassName,
                  )}
                >
                  <AnimatedNumber
                    value={value}
                    decimals={0}
                    prefix={card.pad && value < 10 ? "0" : ""}
                  />
                </p>
              </div>
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  card.iconClassName,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
