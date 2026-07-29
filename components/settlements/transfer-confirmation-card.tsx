"use client";

import { format, parseISO } from "date-fns";

import { StatusBadge } from "@/components/settlements/status-badge";
import { cn } from "@/lib/utils";
import type { PaymentDetails } from "@/types/settlements";

interface TransferConfirmationCardProps {
  payment: PaymentDetails;
  className?: string;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{value}</span>
    </div>
  );
}

export function TransferConfirmationCard({
  payment,
  className,
}: TransferConfirmationCardProps) {
  const hasTransfer = Boolean(payment.utrNumber);

  if (!hasTransfer) {
    return (
      <div className={cn("space-y-3", className)}>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Transfer Confirmation
        </h4>
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
          <p className="text-sm text-slate-500">No payment history available</p>
          <p className="mt-1 text-xs text-slate-400">
            Transfer details will appear once funds are disbursed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Transfer Confirmation
      </h4>
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <DetailRow label="UTR Number" value={payment.utrNumber ?? "—"} />
        {payment.transferDate ? (
          <DetailRow
            label="Transfer Date"
            value={format(parseISO(payment.transferDate), "MMM dd, yyyy")}
          />
        ) : null}
        <DetailRow label="Payment Mode" value={payment.paymentMode} />
        <DetailRow label="Bank Name" value={payment.bankName} />
        <DetailRow label="Account Number" value={payment.maskedAccountNumber} />
        {payment.paymentReference ? (
          <DetailRow
            label="Payment Reference"
            value={payment.paymentReference}
          />
        ) : null}
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm text-slate-500">Status</span>
          <StatusBadge status={payment.status} />
        </div>
      </div>
    </div>
  );
}
