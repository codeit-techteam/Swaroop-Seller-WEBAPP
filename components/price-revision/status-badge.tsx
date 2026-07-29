"use client";

import { cva } from "class-variance-authority";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { PriceRevisionStatus } from "@/types/price-revision";
import { PRICE_REVISION_STATUS_LABELS } from "@/types/price-revision";

const variants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
  {
    variants: {
      status: {
        pending_response: "border-orange-200 bg-orange-50 text-orange-700",
        countered: "border-blue-200 bg-blue-50 text-blue-700",
        accepted: "border-emerald-200 bg-emerald-50 text-emerald-700",
        rejected: "border-red-200 bg-red-50 text-red-600",
        expired: "border-red-200 bg-red-50 text-red-600",
        completed: "border-slate-200 bg-slate-100 text-slate-600",
      },
    },
    defaultVariants: {
      status: "pending_response",
    },
  },
);

interface StatusBadgeProps {
  status: PriceRevisionStatus;
  className?: string;
  animated?: boolean;
}

export function StatusBadge({
  status,
  className,
  animated = false,
}: StatusBadgeProps) {
  const badge = (
    <span className={cn(variants({ status }), className)}>
      {PRICE_REVISION_STATUS_LABELS[status]}
    </span>
  );

  if (!animated) return badge;

  return (
    <motion.span
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {badge}
    </motion.span>
  );
}
