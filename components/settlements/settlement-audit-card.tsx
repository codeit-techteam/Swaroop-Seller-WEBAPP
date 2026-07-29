"use client";

import { motion } from "framer-motion";

import { cn, formatCurrency } from "@/lib/utils";
import type { SettlementAudit } from "@/types/settlements";

interface SettlementAuditCardProps {
  audit: SettlementAudit;
  className?: string;
}

function AuditLine({
  label,
  amount,
  variant = "neutral",
  delay = 0,
}: {
  label: string;
  amount: number;
  variant?: "neutral" | "deduction" | "credit";
  delay?: number;
}) {
  const formatted = formatCurrency(Math.abs(amount));
  const display =
    variant === "deduction"
      ? `-${formatted}`
      : variant === "credit"
        ? `+${formatted}`
        : formatted;

  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between gap-4 py-2 text-sm"
    >
      <span className="text-slate-600">{label}</span>
      <span
        className={cn(
          "font-medium tabular-nums",
          variant === "deduction" && "text-red-600",
          variant === "credit" && "text-emerald-600",
          variant === "neutral" && "text-slate-800",
        )}
      >
        {display}
      </span>
    </motion.div>
  );
}

export function SettlementAuditCard({
  audit,
  className,
}: SettlementAuditCardProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Settlement Audit
      </h4>
      <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
        <AuditLine
          label="Gross Invoice Value"
          amount={audit.grossInvoiceValue}
          delay={0}
        />
        <AuditLine
          label={`PetroTrade Commission (${audit.commissionRate}%)`}
          amount={audit.commissionAmount}
          variant="deduction"
          delay={0.05}
        />
        <AuditLine
          label={`TDS Deduction (u/s 194Q · ${audit.tdsRate}%)`}
          amount={audit.tdsAmount}
          variant="deduction"
          delay={0.1}
        />
        {audit.gstReversal > 0 ? (
          <AuditLine
            label="GST Reversal"
            amount={audit.gstReversal}
            variant="credit"
            delay={0.15}
          />
        ) : null}
        {audit.inputTaxCredit > 0 ? (
          <AuditLine
            label="Input Tax Credit"
            amount={audit.inputTaxCredit}
            variant="credit"
            delay={0.2}
          />
        ) : null}
        {audit.platformCharges > 0 ? (
          <AuditLine
            label="Platform Charges"
            amount={audit.platformCharges}
            variant="deduction"
            delay={0.25}
          />
        ) : null}
        {audit.otherAdjustments > 0 ? (
          <AuditLine
            label="Other Adjustments"
            amount={audit.otherAdjustments}
            variant="deduction"
            delay={0.3}
          />
        ) : null}

        <div className="mt-3 border-t border-slate-200 pt-3">
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex items-center justify-between gap-4"
          >
            <span className="text-sm font-semibold text-slate-800">
              Final Net Settlement
            </span>
            <span className="text-lg font-bold tabular-nums text-slate-900">
              {formatCurrency(audit.netSettlement)}
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
