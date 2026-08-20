"use client";

import { ActionDrawer } from "@/components/erp";
import { PaymentModeBadge } from "@/components/finance/payment-mode-badge";
import { PaymentTrackTimeline } from "@/components/finance/payment-track";
import { OpsStatusBadge } from "@/components/operations";
import { Button } from "@/components/ui/button";
import { formatCompactInr } from "@/lib/utils";
import { PAYMENT_MODE_LABELS, type PaymentRecord } from "@/types/finance";

interface PaymentDrawerProps {
  open: boolean;
  payment: PaymentRecord | null;
  onClose: () => void;
  onMarkSettled: (id: string) => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-800">
        {value}
      </span>
    </div>
  );
}

export function PaymentDrawer({
  open,
  payment,
  onClose,
  onMarkSettled,
}: PaymentDrawerProps) {
  if (!payment) return null;

  const canSettle =
    payment.status !== "SETTLED" && payment.status !== "FAILED";

  return (
    <ActionDrawer
      open={open}
      onClose={onClose}
      title={`Track · ${payment.paymentId}`}
      widthClassName="w-full max-w-md"
      footer={
        canSettle ? (
          <Button
            className="w-full bg-[#1B6EF3] hover:bg-[#1558c4]"
            onClick={() => onMarkSettled(payment.id)}
          >
            Mark settled
          </Button>
        ) : null
      }
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <PaymentModeBadge
              mode={payment.mode}
              creditDays={payment.creditDays}
            />
            <OpsStatusBadge status={payment.status} />
          </div>
          <p className="mt-3 text-2xl font-bold tabular-nums tracking-tight text-slate-900">
            {formatCompactInr(payment.amount)}
          </p>
          <p className="mt-1 text-sm text-slate-500">{payment.counterparty}</p>

          <div className="mt-3 space-y-0">
            <DetailRow label="Order" value={payment.orderId} />
            <DetailRow
              label="Payment mode"
              value={
                payment.mode === "CREDIT" && payment.creditDays
                  ? `Credit · ${payment.creditDays} days`
                  : PAYMENT_MODE_LABELS[payment.mode]
              }
            />
            <DetailRow label="Due date" value={payment.dueDate} />
            {payment.paidAt ? (
              <DetailRow label="Paid at" value={payment.paidAt} />
            ) : null}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Payment track
          </h3>
          <PaymentTrackTimeline track={payment.track} />
        </div>
      </div>
    </ActionDrawer>
  );
}
