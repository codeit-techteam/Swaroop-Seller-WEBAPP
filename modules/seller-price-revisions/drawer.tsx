"use client";

import { DetailDrawer } from "@/components/drawers/detail-drawer";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Button } from "@/components/ui/button";
import { formatMt, formatPricePerKg } from "@/lib/seller/format";
import {
  formatDeltaAmount,
  formatDeltaPercent,
  formatOpsValue,
  priceDelta,
} from "@/lib/seller-ops";
import { formatDate } from "@/lib/utils";
import type { PriceRevision } from "@/types/seller-ops";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

export function PriceRevisionDrawer({
  revision,
  busy,
  onOpenChange,
  onAccept,
  onCounter,
  onReject,
}: {
  revision: PriceRevision | null;
  busy?: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  onCounter: () => void;
  onReject: () => void;
}) {
  const delta = revision
    ? priceDelta(revision.originalPrice, revision.requestedPrice)
    : { amount: 0, percent: 0 };
  const actionable =
    revision &&
    (revision.status === "PENDING" ||
      revision.status === "AWAITING_RESPONSE" ||
      revision.status === "COUNTER_OFFER");

  return (
    <DetailDrawer
      open={Boolean(revision)}
      onOpenChange={onOpenChange}
      title={revision?.id ?? "Price revision"}
      description={revision?.buyerName}
      className="sm:max-w-xl"
    >
      {revision ? (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <SellerStatusBadge status={revision.status} />
          </div>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Request summary
            </h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 p-3">
              <Field label="Request ID" value={revision.id} />
              <Field label="Buyer" value={revision.buyerName} />
              <Field label="Product" value={revision.productName} />
              <Field label="Grade" value={revision.gradeName} />
              <Field label="Quantity" value={formatMt(revision.quantityMt)} />
              <Field
                label="Total value"
                value={formatOpsValue(revision.totalValue)}
              />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Price comparison
            </h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 p-3">
              <Field
                label="Original Seller Price"
                value={formatPricePerKg(revision.originalPrice)}
              />
              <Field
                label="Buyer Requested Price"
                value={formatPricePerKg(revision.requestedPrice)}
              />
              <Field label="Difference" value={formatDeltaAmount(delta.amount)} />
              <Field
                label="Percentage Difference"
                value={formatDeltaPercent(delta.percent)}
              />
              {revision.counterPrice ? (
                <Field
                  label="Seller Counter Price"
                  value={formatPricePerKg(revision.counterPrice)}
                />
              ) : null}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Commercial details
            </h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 p-3">
              <Field label="Quantity" value={formatMt(revision.quantityMt)} />
              <Field label="Delivery Location" value={revision.deliveryLocation} />
              <Field
                label="Requested Delivery"
                value={formatDate(revision.requestedDelivery)}
              />
              <Field label="Payment Terms" value={revision.paymentTerms} />
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Reason for revision
            </h3>
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {revision.reason}
            </p>
          </section>

          {revision.activity.length ? (
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Activity
              </h3>
              <ul className="space-y-2">
                {revision.activity.map((item) => (
                  <li key={item.id} className="text-sm">
                    <p className="text-slate-800">{item.message}</p>
                    <p className="text-xs text-slate-400">
                      {formatDate(item.at)} · {item.actor}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {actionable ? (
            <div className="grid gap-2 sm:grid-cols-3">
              <Button
                className="bg-[#0B1F3A] hover:bg-[#122846]"
                disabled={busy}
                onClick={onAccept}
              >
                Accept Requested Price
              </Button>
              <Button variant="outline" disabled={busy} onClick={onCounter}>
                Counter Offer
              </Button>
              <Button
                variant="outline"
                className="text-red-600"
                disabled={busy}
                onClick={onReject}
              >
                Reject
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
          <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
        </div>
      )}
    </DetailDrawer>
  );
}
