"use client";

import Link from "next/link";
import toast from "react-hot-toast";

import { DetailDrawer } from "@/components/drawers/detail-drawer";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { formatMt, formatPricePerKg } from "@/lib/seller/format";
import { formatOpsValue } from "@/lib/seller-ops";
import { formatDate } from "@/lib/utils";
import type { ProcurementRecord } from "@/types/seller-ops";

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900">{value || "—"}</p>
    </div>
  );
}

export function ProcurementDrawer({
  record,
  busy,
  onOpenChange,
  onAcceptPr,
  onRejectPr,
  onOpenRevision,
  onAcceptPrice,
  onCounter,
  onRejectPrice,
  onAcknowledgePo,
  onConfirmPayment,
}: {
  record: ProcurementRecord | null;
  busy?: boolean;
  onOpenChange: (open: boolean) => void;
  onAcceptPr: () => void;
  onRejectPr: () => void;
  onOpenRevision: () => void;
  onAcceptPrice: () => void;
  onCounter: () => void;
  onRejectPrice: () => void;
  onAcknowledgePo: () => void;
  onConfirmPayment: () => void;
}) {
  const stage = record?.currentStage;

  return (
    <DetailDrawer
      open={Boolean(record)}
      onOpenChange={onOpenChange}
      title={record?.purchaseRequestId ?? "Procurement"}
      description={record?.buyerName}
      className="sm:max-w-2xl"
    >
      {record ? (
        <div className="space-y-6">
          <SellerStatusBadge status={record.currentStage} />

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Procurement summary
            </h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
              <Field label="Buyer" value={record.buyerName} />
              <Field label="Product" value={record.productName} />
              <Field label="Grade" value={record.gradeName} />
              <Field label="Quantity" value={formatMt(record.quantityMt)} />
              <Field label="Delivery Location" value={record.deliveryLocation} />
              <Field label="Order Value" value={formatOpsValue(record.orderValue)} />
              <Field label="Payment Terms" value={record.paymentTerms} />
              <Field
                label="Expected Delivery"
                value={formatDate(record.expectedDelivery)}
              />
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Lifecycle timeline
            </h3>
            <ol className="space-y-2">
              {record.timeline.map((step) => (
                <li key={step.id} className="flex gap-2 text-sm">
                  <span className="mt-0.5 w-4 text-center">
                    {step.status === "completed"
                      ? "✓"
                      : step.status === "current"
                        ? "●"
                        : "○"}
                  </span>
                  <div>
                    <p className="font-medium text-slate-800">{step.label}</p>
                    <p className="text-xs text-slate-400">
                      {[step.at ? formatDate(step.at) : null, step.actor, step.action]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Commercial
            </h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
              <Field
                label="Original Price"
                value={formatPricePerKg(record.commercial.originalPrice)}
              />
              <Field
                label="Requested Price"
                value={formatPricePerKg(record.commercial.requestedPrice)}
              />
              <Field
                label="Seller Counter Price"
                value={
                  record.commercial.counterPrice
                    ? formatPricePerKg(record.commercial.counterPrice)
                    : undefined
                }
              />
              <Field
                label="Final Price"
                value={
                  record.commercial.finalPrice
                    ? formatPricePerKg(record.commercial.finalPrice)
                    : undefined
                }
              />
              <Field label="Payment Terms" value={record.commercial.paymentTerms} />
              <Field
                label="Delivery Terms"
                value={record.commercial.deliveryTerms}
              />
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Order
            </h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
              <Field label="PO Number" value={record.order.poNumber} />
              <Field label="Order Number" value={record.order.orderNumber} />
              <Field label="Order Status" value={record.order.orderStatus} />
              <Field label="Quantity" value={formatMt(record.order.quantityMt)} />
              <Field label="Warehouse" value={record.order.warehouseName} />
              <Field label="Dispatch Status" value={record.order.dispatchStatus} />
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Payment
            </h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
              <Field label="Payment Method" value={record.payment.method} />
              <Field label="Payment Status" value={record.payment.status} />
              <Field
                label="Amount Paid"
                value={formatOpsValue(record.payment.amountPaid)}
              />
              <Field
                label="Amount Pending"
                value={formatOpsValue(record.payment.amountPending)}
              />
              <Field label="Due Date" value={formatDate(record.payment.dueDate)} />
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Fulfillment
            </h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
              <Field
                label="Vehicle Slot"
                value={record.fulfillment.vehicleSlotId}
              />
              <Field
                label="Dispatch Date"
                value={
                  record.fulfillment.dispatchDate
                    ? formatDate(record.fulfillment.dispatchDate)
                    : undefined
                }
              />
              <Field
                label="Vehicle Number"
                value={record.fulfillment.vehicleNumber}
              />
              <Field label="Shipment ID" value={record.fulfillment.shipmentId} />
              <Field
                label="Tracking Status"
                value={record.fulfillment.trackingStatus}
              />
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Documents
            </h3>
            <ul className="space-y-2">
              {record.documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <span>
                    {doc.kind}
                    {!doc.available ? (
                      <span className="ml-2 text-xs text-red-500">Missing</span>
                    ) : null}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={!doc.available}
                      onClick={() => toast.success(`Previewing ${doc.kind}`)}
                    >
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={!doc.available}
                      onClick={() => toast.success(`${doc.kind} downloaded`)}
                    >
                      Download
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Activity log
            </h3>
            <ul className="space-y-2">
              {record.activity.map((item) => (
                <li key={item.id} className="text-sm">
                  <p className="text-slate-800">{item.message}</p>
                  <p className="text-xs text-slate-400">
                    {formatDate(item.at)} · {item.actor}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-wrap gap-2">
            {stage === "PR" ? (
              <>
                <Button
                  className="bg-[#0B1F3A] hover:bg-[#122846]"
                  disabled={busy}
                  onClick={onAcceptPr}
                >
                  Accept PR
                </Button>
                <Button variant="outline" disabled={busy} onClick={onRejectPr}>
                  Reject PR
                </Button>
                <Button variant="outline" onClick={onOpenRevision}>
                  Open Price Revision
                </Button>
              </>
            ) : null}
            {stage === "COMMERCIAL_REVIEW" || stage === "PRICE_REVISION" ? (
              <>
                <Button
                  className="bg-[#0B1F3A] hover:bg-[#122846]"
                  disabled={busy}
                  onClick={onAcceptPrice}
                >
                  Accept Price
                </Button>
                <Button variant="outline" disabled={busy} onClick={onCounter}>
                  Counter Offer
                </Button>
                <Button variant="outline" disabled={busy} onClick={onRejectPrice}>
                  Reject
                </Button>
              </>
            ) : null}
            {stage === "PO" ? (
              <>
                <Button variant="outline" asChild>
                  <Link href={ROUTES.ORDERS}>View PO</Link>
                </Button>
                {!record.poAcknowledged ? (
                  <Button
                    className="bg-[#0B1F3A] hover:bg-[#122846]"
                    disabled={busy}
                    onClick={onAcknowledgePo}
                  >
                    Acknowledge PO
                  </Button>
                ) : null}
              </>
            ) : null}
            {stage === "PAYMENT" ? (
              <>
                <Button variant="outline" asChild>
                  <Link href={ROUTES.PAYMENTS}>View Payment</Link>
                </Button>
                <Button
                  className="bg-[#0B1F3A] hover:bg-[#122846]"
                  disabled={busy}
                  onClick={onConfirmPayment}
                >
                  Confirm Payment Received
                </Button>
              </>
            ) : null}
            {stage === "DISPATCH" ? (
              <>
                <Button variant="outline" asChild>
                  <Link
                    href={`${ROUTES.VEHICLE_SLOTS}?orderId=${record.orderId ?? ""}`}
                  >
                    Book Vehicle Slot
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={ROUTES.DISPATCH}>Open Dispatch</Link>
                </Button>
              </>
            ) : null}
            {stage === "SHIPMENT" ? (
              <Button variant="outline" asChild>
                <Link href={ROUTES.SHIPMENTS}>Track Shipment</Link>
              </Button>
            ) : null}
            {stage === "SETTLEMENT" ? (
              <Button variant="outline" asChild>
                <Link href={ROUTES.SETTLEMENTS}>View Settlement</Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </DetailDrawer>
  );
}
