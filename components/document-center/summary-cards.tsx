"use client";

import { motion } from "framer-motion";
import { AlertTriangle, FileText, FolderOpen, ShieldCheck } from "lucide-react";

import { AnimatedNumber } from "@/components/erp/animated-number";
import { cn } from "@/lib/utils";
import type { DocumentSummary } from "@/types/documents";

const cards: {
  key: keyof DocumentSummary;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  valueClass: string;
  iconClass: string;
  suffix?: string;
  pad?: boolean;
}[] = [
  {
    key: "complianceScore",
    label: "Compliance Score",
    icon: ShieldCheck,
    accent: "border-l-[#1B6EF3]",
    valueClass: "text-[#0B1F3A]",
    iconClass: "bg-[#E8F1FF] text-[#1B6EF3]",
    suffix: "%",
  },
  {
    key: "pendingVerification",
    label: "Pending Verification",
    icon: FolderOpen,
    accent: "border-l-red-500",
    valueClass: "text-red-600",
    iconClass: "bg-red-50 text-red-600",
    pad: true,
  },
  {
    key: "expiringSoon",
    label: "Expiring Soon",
    icon: AlertTriangle,
    accent: "border-l-amber-500",
    valueClass: "text-amber-600",
    iconClass: "bg-amber-50 text-amber-600",
    pad: true,
  },
  {
    key: "totalDocuments",
    label: "Total Documents",
    icon: FileText,
    accent: "border-l-slate-400",
    valueClass: "text-slate-900",
    iconClass: "bg-slate-100 text-slate-600",
  },
];

interface SummaryCardsProps {
  summary: DocumentSummary;
  onCardClick?: (key: keyof DocumentSummary) => void;
  className?: string;
}

export function SummaryCards({
  summary,
  onCardClick,
  className,
}: SummaryCardsProps) {
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
              "rounded-xl border border-slate-200 border-l-4 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md",
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
                    suffix={card.suffix ?? ""}
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
