"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, PackageCheck, Truck } from "lucide-react";

import { AnimatedNumber } from "@/components/erp/animated-number";
import { cn } from "@/lib/utils";
import type { ShipmentSummary } from "@/types/shipments";

const cards: {
  key: keyof ShipmentSummary;
  label: string;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  valueClassName?: string;
  accentClassName: string;
  pad?: boolean;
}[] = [
  {
    key: "readyToDispatch",
    label: "Ready To Dispatch",
    icon: PackageCheck,
    iconClassName: "bg-blue-50 text-blue-600",
    valueClassName: "text-slate-900",
    accentClassName: "border-l-blue-500",
    pad: true,
  },
  {
    key: "inTransit",
    label: "In Transit",
    icon: Truck,
    iconClassName: "bg-teal-50 text-teal-600",
    valueClassName: "text-teal-700",
    accentClassName: "border-l-teal-500",
  },
  {
    key: "deliveredThisMonth",
    label: "Delivered",
    sublabel: "This Month",
    icon: CheckCircle2,
    iconClassName: "bg-emerald-50 text-emerald-600",
    valueClassName: "text-emerald-600",
    accentClassName: "border-l-emerald-500",
  },
  {
    key: "delayed",
    label: "Delayed Shipments",
    icon: AlertTriangle,
    iconClassName: "bg-red-50 text-red-600",
    valueClassName: "text-red-600",
    accentClassName: "border-l-red-500",
    pad: true,
  },
];

interface ShipmentSummaryCardsProps {
  summary: ShipmentSummary;
  className?: string;
}

export function ShipmentSummaryCards({
  summary,
  className,
}: ShipmentSummaryCardsProps) {
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
            className={cn(
              "rounded-xl border border-slate-200 border-l-4 bg-white p-4 shadow-sm",
              card.accentClassName,
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>
                {card.sublabel ? (
                  <p className="text-[10px] text-slate-400">{card.sublabel}</p>
                ) : null}
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
