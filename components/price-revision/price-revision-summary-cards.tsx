"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
} from "lucide-react";

import { AnimatedNumber } from "@/components/erp/animated-number";
import { cn } from "@/lib/utils";
import type { PriceRevisionSummary } from "@/types/price-revision";

const cards: {
  key: keyof PriceRevisionSummary;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  highlight?: boolean;
  pad?: boolean;
}[] = [
  {
    key: "activeRequests",
    label: "Active Requests",
    icon: FileText,
    iconClassName: "bg-blue-50 text-[#1B6EF3]",
  },
  {
    key: "acceptedMtd",
    label: "Accepted (MTD)",
    icon: CheckCircle2,
    iconClassName: "bg-emerald-50 text-emerald-600",
    pad: true,
  },
  {
    key: "pendingResponse",
    label: "Pending Response",
    icon: AlertCircle,
    iconClassName: "bg-orange-50 text-orange-600",
    highlight: true,
    pad: true,
  },
  {
    key: "counterOffers",
    label: "Counter Offers",
    icon: RefreshCw,
    iconClassName: "bg-violet-50 text-violet-600",
    pad: true,
  },
  {
    key: "expired",
    label: "Expired",
    icon: Clock3,
    iconClassName: "bg-red-50 text-red-500",
    pad: true,
  },
];

interface PriceRevisionSummaryCardsProps {
  summary: PriceRevisionSummary;
  className?: string;
}

export function PriceRevisionSummaryCards({
  summary,
  className,
}: PriceRevisionSummaryCardsProps) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
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
            transition={{ delay: index * 0.06, duration: 0.35 }}
            whileHover={{ y: -2 }}
            className={cn(
              "rounded-xl border bg-white p-5 shadow-sm",
              card.highlight
                ? "border-orange-300 ring-1 ring-orange-100"
                : "border-slate-200",
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
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
