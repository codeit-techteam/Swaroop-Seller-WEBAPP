"use client";

import { cn } from "@/lib/utils";
import type { PurchaseRequestStatus } from "@/types/purchase-requests";

const STATUS_LABELS: Record<PurchaseRequestStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  counter_sent: "Counter sent",
  expired: "Expired",
  closed: "Closed",
};

const STATUS_DOT: Record<PurchaseRequestStatus, string> = {
  pending: "bg-amber-500",
  accepted: "bg-emerald-500",
  rejected: "bg-red-500",
  counter_sent: "bg-blue-500",
  expired: "bg-slate-400",
  closed: "bg-slate-400",
};

interface StatusBadgeProps {
  status: PurchaseRequestStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium text-slate-600",
        className,
      )}
    >
      <span
        className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[status])}
        aria-hidden
      />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function purchaseStatusLabel(status: string): string {
  if (status === "All Statuses") return status;
  if (status === "counter_sent") return "Counter sent";
  return status.charAt(0).toUpperCase() + status.slice(1);
}
