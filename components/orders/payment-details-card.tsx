"use client";

import { CheckCircle2, CreditCard, FileText, Wallet } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Order } from "@/types/orders";
import { PAYMENT_STATUS_LABELS } from "@/types/orders";

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

interface PaymentDetailsCardProps {
  order: Order;
  className?: string;
  onVerify?: () => void;
}

export function PaymentDetailsCard({
  order,
  className,
  onVerify,
}: PaymentDetailsCardProps) {
  const { payment } = order;
  const statusStyles: Record<string, string> = {
    awaiting_payment: "bg-amber-50 text-amber-800 border-amber-200",
    proof_submitted: "bg-sky-50 text-sky-800 border-sky-200",
    verified: "bg-emerald-50 text-emerald-800 border-emerald-200",
    collect_on_delivery: "bg-slate-50 text-slate-700 border-slate-200",
    collected: "bg-emerald-50 text-emerald-800 border-emerald-200",
  };

  const canVerify =
    payment.status === "awaiting_payment" ||
    payment.status === "proof_submitted";

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-[#1B6EF3]" />
          <h3 className="text-sm font-bold text-slate-900">Payment Details</h3>
        </div>
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
            statusStyles[payment.status],
          )}
        >
          {PAYMENT_STATUS_LABELS[payment.status]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Terms
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {order.paymentLabel}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Amount Due
          </p>
          <p className="mt-1 text-sm font-semibold tabular-nums text-slate-800">
            {formatInr(payment.amountDue)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Amount Paid
          </p>
          <p className="mt-1 text-sm font-semibold tabular-nums text-slate-800">
            {formatInr(payment.amountPaid)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            UTR / Ref
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {payment.utr ?? "—"}
          </p>
        </div>
      </div>

      {payment.notes ? (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          {payment.notes}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        {payment.proofFileName ? (
          <span className="inline-flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {payment.proofFileName}
          </span>
        ) : null}
        {payment.verifiedAt ? (
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Verified {new Date(payment.verifiedAt).toLocaleDateString("en-GB")}
            {payment.verifiedBy ? ` · ${payment.verifiedBy}` : ""}
          </span>
        ) : null}
      </div>

      {canVerify && onVerify ? (
        <button
          type="button"
          onClick={onVerify}
          className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#0B1F3A] text-sm font-semibold text-white hover:bg-[#122846]"
        >
          <CreditCard className="h-4 w-4" />
          Verify Payment
        </button>
      ) : null}
    </div>
  );
}
