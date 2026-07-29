"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock3, FileWarning } from "lucide-react";

import { AnimatedNumber } from "@/components/erp/animated-number";
import { cn } from "@/lib/utils";
import type { ComplianceSummary } from "@/types/compliance";

const cards: {
  key: keyof ComplianceSummary;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  valueClass: string;
  iconClass: string;
  pad?: boolean;
}[] = [
  {
    key: "verified",
    label: "Verified Documents",
    icon: CheckCircle2,
    accent: "border-t-emerald-500",
    valueClass: "text-emerald-600",
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    key: "expiringSoon",
    label: "Expiring Soon",
    icon: Clock3,
    accent: "border-t-orange-500",
    valueClass: "text-orange-600",
    iconClass: "bg-orange-50 text-orange-600",
    pad: true,
  },
  {
    key: "expired",
    label: "Expired Documents",
    icon: FileWarning,
    accent: "border-t-red-500",
    valueClass: "text-red-600",
    iconClass: "bg-red-50 text-red-600",
    pad: true,
  },
  {
    key: "pendingVerification",
    label: "Pending Verification",
    icon: AlertTriangle,
    accent: "border-t-sky-500",
    valueClass: "text-slate-900",
    iconClass: "bg-sky-50 text-sky-600",
    pad: true,
  },
];

interface ComplianceSummaryCardsProps {
  summary: ComplianceSummary;
  onCardClick?: (key: keyof ComplianceSummary) => void;
  className?: string;
}

export function ComplianceSummaryCards({
  summary,
  onCardClick,
  className,
}: ComplianceSummaryCardsProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        const value = summary[card.key];
        return (
          <motion.button
            key={card.key}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ y: -2 }}
            onClick={() => onCardClick?.(card.key)}
            className={cn(
              "rounded-xl border border-slate-200 border-t-4 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md",
              card.accent,
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>
                <p
                  className={cn(
                    "mt-2 text-3xl font-bold tabular-nums tracking-tight",
                    card.valueClass,
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
                  card.iconClass,
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
