"use client";

import { cn } from "@/lib/utils";
import type { OfferStatus } from "@/types/offers";

const statusConfig: Record<OfferStatus, { label: string; className: string }> =
  {
    active: {
      label: "Active",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    paused: {
      label: "Paused",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    expired: {
      label: "Expired",
      className: "bg-slate-100 text-slate-600 border-slate-200",
    },
    draft: {
      label: "Draft",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    pending_review: {
      label: "Pending Review",
      className: "bg-orange-50 text-orange-700 border-orange-200",
    },
    approved: {
      label: "Approved",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    need_changes: {
      label: "Need Changes",
      className: "bg-red-50 text-red-700 border-red-200",
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-50 text-red-700 border-red-200",
    },
  };

interface OfferStatusBadgeProps {
  status: OfferStatus;
  className?: string;
}

export function OfferStatusBadge({ status, className }: OfferStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
