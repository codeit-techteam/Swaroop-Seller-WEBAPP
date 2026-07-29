"use client";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { PurchaseRequestStatus } from "@/types/purchase-requests";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
  {
    variants: {
      variant: {
        pending: "border-amber-200 bg-amber-50 text-amber-700",
        accepted: "border-emerald-200 bg-emerald-50 text-emerald-700",
        rejected: "border-red-300 bg-white text-red-600",
        counter_sent: "border-blue-200 bg-blue-50 text-blue-700",
        expired: "border-slate-300 bg-slate-100 text-slate-500",
        closed: "border-slate-200 bg-slate-50 text-slate-600",
      },
    },
    defaultVariants: {
      variant: "pending",
    },
  },
);

export type StatusBadgeVariant = NonNullable<
  VariantProps<typeof statusBadgeVariants>["variant"]
>;

const STATUS_LABELS: Record<PurchaseRequestStatus, string> = {
  pending: "PENDING",
  accepted: "ACCEPTED",
  rejected: "REJECTED",
  counter_sent: "COUNTER SENT",
  expired: "EXPIRED",
  closed: "CLOSED",
};

interface StatusBadgeProps {
  status: PurchaseRequestStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ variant: status }), className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function purchaseStatusLabel(status: string): string {
  if (status === "All Statuses") return status;
  if (status === "counter_sent") return "Counter Sent";
  return status.charAt(0).toUpperCase() + status.slice(1);
}
