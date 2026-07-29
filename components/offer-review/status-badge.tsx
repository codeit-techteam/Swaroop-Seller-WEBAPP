"use client";

import { cva } from "class-variance-authority";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import {
  OFFER_REVIEW_STATUS_LABELS,
  type OfferReviewStatus,
} from "@/types/offer-review";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
  {
    variants: {
      status: {
        pending_review: "border-amber-200 bg-amber-50 text-amber-700",
        needs_changes: "border-red-200 bg-red-50 text-red-700",
        approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
        published: "border-blue-200 bg-blue-50 text-blue-700",
        rejected: "border-rose-200 bg-rose-50 text-rose-700",
        withdrawn: "border-slate-200 bg-slate-100 text-slate-600",
        draft: "border-slate-200 bg-slate-50 text-slate-500",
      },
    },
    defaultVariants: {
      status: "pending_review",
    },
  },
);

interface StatusBadgeProps {
  status: OfferReviewStatus;
  className?: string;
  animated?: boolean;
}

export function StatusBadge({
  status,
  className,
  animated = true,
}: StatusBadgeProps) {
  const badge = (
    <span className={cn(badgeVariants({ status }), className)}>
      {OFFER_REVIEW_STATUS_LABELS[status]}
    </span>
  );

  if (!animated) return badge;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {badge}
    </motion.span>
  );
}
