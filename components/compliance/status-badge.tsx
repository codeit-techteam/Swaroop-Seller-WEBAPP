"use client";

import { cva } from "class-variance-authority";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { ComplianceDocumentStatus } from "@/types/compliance";
import { COMPLIANCE_STATUS_LABELS } from "@/types/compliance";

const variants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
  {
    variants: {
      status: {
        verified: "border-emerald-200 bg-emerald-50 text-emerald-700",
        pending_review: "border-amber-200 bg-amber-50 text-amber-700",
        expiring_soon: "border-orange-200 bg-orange-50 text-orange-700",
        expired: "border-red-200 bg-red-50 text-red-600",
        rejected: "border-rose-200 bg-rose-50 text-rose-700",
        uploaded: "border-sky-200 bg-sky-50 text-sky-700",
      },
    },
    defaultVariants: {
      status: "verified",
    },
  },
);

interface StatusBadgeProps {
  status: ComplianceDocumentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(variants({ status }), className)}
    >
      {COMPLIANCE_STATUS_LABELS[status]}
    </motion.span>
  );
}
