"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  PackageCheck,
  Truck,
  Warehouse,
} from "lucide-react";

import { AnimatedNumber } from "@/components/erp/animated-number";
import { cn } from "@/lib/utils";
import type { DispatchSummary } from "@/types/dispatch";

const cards: {
  key: keyof DispatchSummary;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  valueClassName?: string;
  pad?: boolean;
}[] = [
  {
    key: "readyForDispatch",
    label: "Ready For Dispatch",
    icon: PackageCheck,
    iconClassName: "bg-slate-100 text-slate-700",
  },
  {
    key: "vehiclePending",
    label: "Vehicle Pending",
    icon: Truck,
    iconClassName: "bg-amber-50 text-amber-600",
    valueClassName: "text-amber-600",
    pad: true,
  },
  {
    key: "loading",
    label: "Loading",
    icon: Warehouse,
    iconClassName: "bg-teal-50 text-teal-600",
    valueClassName: "text-teal-600",
    pad: true,
  },
  {
    key: "dispatchedToday",
    label: "Dispatched Today",
    icon: Truck,
    iconClassName: "bg-slate-100 text-slate-700",
  },
  {
    key: "deliveredToday",
    label: "Delivered Today",
    icon: CheckCircle2,
    iconClassName: "bg-emerald-50 text-emerald-600",
    valueClassName: "text-emerald-600",
  },
  {
    key: "delayed",
    label: "Delayed",
    icon: AlertTriangle,
    iconClassName: "bg-red-50 text-red-600",
    valueClassName: "text-red-600",
    pad: true,
  },
];

interface DispatchSummaryCardsProps {
  summary: DispatchSummary;
  className?: string;
}

export function DispatchSummaryCards({
  summary,
  className,
}: DispatchSummaryCardsProps) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6",
        className,
      )}
    >
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
                    decimals={0}
                    prefix={card.pad && value < 10 ? "0" : ""}
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
