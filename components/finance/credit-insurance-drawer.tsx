"use client";

import { ActionDrawer } from "@/components/erp";
import { OpsStatusBadge } from "@/components/operations";
import { cn, formatCompactInr } from "@/lib/utils";
import type { CreditInsurancePolicy } from "@/types/finance";

interface CreditInsuranceDrawerProps {
  open: boolean;
  policy: CreditInsurancePolicy | null;
  onClose: () => void;
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

function utilizationPercent(policy: CreditInsurancePolicy): number {
  if (policy.coverAmount <= 0) return 0;
  return Math.min(
    100,
    Math.round((policy.utilized / policy.coverAmount) * 100),
  );
}

function utilizationBarClass(percent: number, status: string): string {
  if (status === "EXPIRED") return "bg-slate-400";
  if (status === "EXHAUSTED" || percent >= 95) return "bg-red-500";
  if (status === "UNDER_REVIEW" || percent >= 80) return "bg-amber-500";
  return "bg-emerald-500";
}

export function CreditInsuranceDrawer({
  open,
  policy,
  onClose,
}: CreditInsuranceDrawerProps) {
  if (!policy) return null;

  const percent = utilizationPercent(policy);
  const available = Math.max(0, policy.coverAmount - policy.utilized);

  return (
    <ActionDrawer
      open={open}
      onClose={onClose}
      title={`Policy · ${policy.policyId}`}
      description={`${policy.buyer} · ${policy.insurer}`}
      widthClassName="w-full max-w-md"
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <OpsStatusBadge status={policy.status} />
            {policy.coverType ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                {policy.coverType}
              </span>
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Cover
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-slate-900">
                {formatCompactInr(policy.coverAmount)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Available
              </p>
              <p
                className={cn(
                  "mt-1 text-xl font-bold tabular-nums tracking-tight",
                  available > 0 ? "text-emerald-700" : "text-red-600",
                )}
              >
                {formatCompactInr(available)}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">
                {percent}% utilized
              </span>
              <span className="tabular-nums text-slate-500">
                {formatCompactInr(policy.utilized)} drawn
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  utilizationBarClass(percent, policy.status),
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <div className="mt-4 space-y-0">
            <DetailRow label="Buyer" value={policy.buyer} />
            <DetailRow label="Insurer" value={policy.insurer} />
            <DetailRow
              label="Valid from"
              value={policy.validFrom ?? "—"}
            />
            <DetailRow label="Valid until" value={policy.validUntil} />
            {policy.lastReviewedAt ? (
              <DetailRow label="Last reviewed" value={policy.lastReviewedAt} />
            ) : null}
          </div>
        </div>

        {policy.notes ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Risk note
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {policy.notes}
            </p>
          </div>
        ) : null}
      </div>
    </ActionDrawer>
  );
}
