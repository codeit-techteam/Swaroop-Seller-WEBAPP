"use client";

import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { ShipmentStatus } from "@/types/shipments";
import { SHIPMENT_STATUS_LABELS } from "@/types/shipments";

const variants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
  {
    variants: {
      status: {
        ready_for_dispatch: "border-orange-200 bg-orange-50 text-orange-700",
        in_transit: "border-teal-200 bg-teal-50 text-teal-700",
        dispatched: "border-violet-200 bg-violet-50 text-violet-700",
        delayed: "border-red-200 bg-red-50 text-red-600",
        delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
        pending: "border-slate-200 bg-slate-50 text-slate-600",
      },
    },
    defaultVariants: {
      status: "pending",
    },
  },
);

interface StatusBadgeProps {
  status: ShipmentStatus;
  isDelayed?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  isDelayed,
  className,
}: StatusBadgeProps) {
  const displayStatus =
    isDelayed && status !== "delivered" ? "delayed" : status;
  return (
    <span className={cn(variants({ status: displayStatus }), className)}>
      {SHIPMENT_STATUS_LABELS[displayStatus]}
    </span>
  );
}
