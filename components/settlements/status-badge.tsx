"use client";

import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { SettlementStatus } from "@/types/settlements";
import { SETTLEMENT_STATUS_LABELS } from "@/types/settlements";

const variants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
  {
    variants: {
      status: {
        pending: "border-slate-200 bg-slate-50 text-slate-600",
        processing: "border-orange-200 bg-orange-50 text-orange-700",
        settled: "border-emerald-200 bg-emerald-50 text-emerald-700",
        failed: "border-red-200 bg-red-50 text-red-600",
        on_hold: "border-amber-200 bg-amber-50 text-amber-700",
        disputed: "border-violet-200 bg-violet-50 text-violet-700",
      },
    },
    defaultVariants: {
      status: "pending",
    },
  },
);

interface StatusBadgeProps {
  status: SettlementStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(variants({ status }), className)}>
      {SETTLEMENT_STATUS_LABELS[status]}
    </span>
  );
}
