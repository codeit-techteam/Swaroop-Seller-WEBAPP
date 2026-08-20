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
  accentClassName: string;
  valueClassName?: string;
  pad?: boolean;
}[] = [
  {
    key: "readyForDispatch",
    label: "Ready For Dispatch",
    icon: PackageCheck,
    iconClassName: "bg-sky-50 text-sky-600",
    accentClassName: "from-sky-400 to-sky-500",
  },
  {
    key: "vehiclePending",
    label: "Vehicle Pending",
    icon: Truck,
    iconClassName: "bg-amber-50 text-amber-600",
    accentClassName: "from-amber-400 to-orange-400",
    valueClassName: "text-amber-600",
    pad: true,
  },
  {
    key: "loading",
    label: "Loading",
    icon: Warehouse,
    iconClassName: "bg-teal-50 text-teal-600",
    accentClassName: "from-teal-400 to-emerald-500",
    valueClassName: "text-teal-600",
    pad: true,
  },
  {
    key: "dispatchedToday",
    label: "Dispatched Today",
    icon: Truck,
    iconClassName: "bg-indigo-50 text-indigo-600",
    accentClassName: "from-indigo-400 to-blue-500",
  },
  {
    key: "deliveredToday",
    label: "Delivered Today",
    icon: CheckCircle2,
    iconClassName: "bg-emerald-50 text-emerald-600",
    accentClassName: "from-emerald-400 to-green-500",
    valueClassName: "text-emerald-600",
  },
  {
    key: "delayed",
    label: "Delayed",
    icon: AlertTriangle,
    iconClassName: "bg-red-50 text-red-600",
    accentClassName: "from-rose-400 to-red-500",
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
            transition={{ delay: index * 0.04, duration: 0.35, ease: "easeOut" }}
            whileHover={{ y: -3 }}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              className={cn(
                "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
                card.accentClassName,
              )}
            />
            <div className="flex items-start justify-between gap-2 pt-0.5">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  {card.label}
                </p>
                <p
                  className={cn(
                    "mt-2.5 text-[28px] font-bold leading-none tracking-tight tabular-nums text-slate-900",
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
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                  card.iconClassName,
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
