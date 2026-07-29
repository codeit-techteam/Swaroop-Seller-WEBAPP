"use client";

import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/orders";
import { ORDER_STATUS_LABELS } from "@/types/orders";

const variants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
  {
    variants: {
      status: {
        new: "border-violet-200 bg-violet-50 text-violet-700",
        accepted: "border-emerald-200 bg-emerald-50 text-emerald-700",
        processing: "border-blue-200 bg-blue-50 text-blue-700",
        dispatch_ready: "border-teal-200 bg-teal-50 text-teal-700",
        in_transit: "border-slate-200 bg-slate-100 text-slate-600",
        delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
        delayed: "border-red-200 bg-red-50 text-red-600",
        cancelled: "border-slate-200 bg-slate-50 text-slate-500",
      },
    },
    defaultVariants: {
      status: "new",
    },
  },
);

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
  /** Detail page uses "Pending Approval" for new orders */
  detailLabel?: boolean;
}

export function OrderStatusBadge({
  status,
  className,
  detailLabel,
}: OrderStatusBadgeProps) {
  const label =
    detailLabel && status === "new"
      ? "Pending Approval"
      : ORDER_STATUS_LABELS[status];

  return <span className={cn(variants({ status }), className)}>{label}</span>;
}
