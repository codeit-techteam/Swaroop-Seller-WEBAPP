"use client";

import { motion } from "framer-motion";
import { Clock3, FileWarning, PackageCheck, Scale } from "lucide-react";

import { AnimatedNumber } from "@/components/erp/animated-number";
import { cn } from "@/lib/utils";
import type { OrderSummary } from "@/types/orders";

const cards: {
  key: keyof OrderSummary;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  valueClassName?: string;
  decimals?: number;
  suffix?: string;
  pad?: boolean;
}[] = [
  {
    key: "totalVolumeMt",
    label: "Total Order Volume (MT)",
    icon: Scale,
    iconClassName: "bg-slate-100 text-slate-700",
  },
  {
    key: "pendingInvoices",
    label: "Pending Invoices",
    icon: FileWarning,
    iconClassName: "bg-amber-50 text-amber-600",
    valueClassName: "text-amber-600",
  },
  {
    key: "avgProcessingDays",
    label: "Avg. Processing Time",
    icon: Clock3,
    iconClassName: "bg-blue-50 text-blue-600",
    decimals: 1,
    suffix: "d",
  },
  {
    key: "readyForDispatch",
    label: "Ready for Dispatch",
    icon: PackageCheck,
    iconClassName: "bg-teal-50 text-teal-600",
    valueClassName: "text-teal-700",
    pad: true,
  },
];

interface OrdersSummaryCardsProps {
  summary: OrderSummary;
  className?: string;
}

export function OrdersSummaryCards({
  summary,
  className,
}: OrdersSummaryCardsProps) {
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
            whileHover={{ y: -2 }}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>
                <p
                  className={cn(
                    "mt-2 text-2xl font-bold tabular-nums text-slate-900",
                    card.valueClassName,
                  )}
                >
                  <AnimatedNumber
                    value={value}
                    decimals={card.decimals ?? 0}
                    prefix={
                      card.pad && value < 10 && Number.isInteger(value)
                        ? "0"
                        : ""
                    }
                    suffix={card.suffix ?? ""}
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
