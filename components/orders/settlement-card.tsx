"use client";

import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SettlementStatus } from "@/types/orders";
import { SETTLEMENT_LABELS } from "@/types/orders";

interface SettlementCardProps {
  status: SettlementStatus;
  className?: string;
}

export function SettlementCard({ status, className }: SettlementCardProps) {
  const styles: Record<SettlementStatus, string> = {
    funds_secured: "bg-[#0B1F3A] text-white",
    settlement_pending: "bg-amber-50 text-amber-800 border border-amber-200",
    settlement_completed: "bg-emerald-600 text-white",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-4 py-3",
        styles[status],
        className,
      )}
    >
      <ShieldCheck className="h-5 w-5 shrink-0 opacity-90" />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
          Settlement Status
        </p>
        <p className="text-sm font-semibold">{SETTLEMENT_LABELS[status]}</p>
      </div>
    </div>
  );
}
