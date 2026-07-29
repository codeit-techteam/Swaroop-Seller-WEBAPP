"use client";

import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { SlotStatus } from "@/types/slot-booking";
import { SLOT_STATUS_LABELS } from "@/types/slot-booking";

const variants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
  {
    variants: {
      status: {
        awaiting: "border-slate-300 bg-white text-slate-500",
        confirmed: "border-slate-900 bg-slate-900 text-white",
        checked_in: "border-emerald-300 bg-white text-emerald-700",
        loading: "border-blue-300 bg-white text-blue-600",
        completed: "border-slate-200 bg-slate-100 text-slate-600",
        cancelled: "border-red-200 bg-red-50 text-red-600",
      },
    },
    defaultVariants: {
      status: "awaiting",
    },
  },
);

interface SlotStatusBadgeProps {
  status: SlotStatus;
  className?: string;
}

export function SlotStatusBadge({ status, className }: SlotStatusBadgeProps) {
  return (
    <span className={cn(variants({ status }), className)}>
      {SLOT_STATUS_LABELS[status]}
    </span>
  );
}
