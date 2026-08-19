"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { EmptyState } from "@/components/common";
import { OperationsShell, OpsStatusBadge } from "@/components/operations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/lib/constants";
import { formatCompactInr, formatDateTime, formatNumber } from "@/lib/utils";
import { findProcurementItem, sellerVisibleOffers } from "@/modules/procurement/selectors";
import { useWorkbench } from "@/modules/procurement/use-workbench";
import { useProcurementStore } from "@/store/procurementStore";

export function ProcurementNegotiationView({ id }: { id: string }) {
  const { allItems, isSeller, isAdmin, sellerId } = useWorkbench();
  const item = useMemo(() => findProcurementItem(allItems, id), [allItems, id]);
  const sendCounterOffer = useProcurementStore((s) => s.sendCounterOffer);
  const sellerCounterOffer = useProcurementStore((s) => s.sellerCounterOffer);
  const finalizeNegotiation = useProcurementStore((s) => s.finalizeNegotiation);
  const sellerAcceptPrice = useProcurementStore((s) => s.sellerAcceptPrice);
  const rejectOffer = useProcurementStore((s) => s.rejectOffer);
  const startNegotiation = useProcurementStore((s) => s.startNegotiation);
  const last = item?.negotiation[item.negotiation.length - 1];
  const [unitPrice, setUnitPrice] = useState(String(last?.unitPrice ?? item?.unitPrice ?? ""));
  const [quantity, setQuantity] = useState(String(last?.quantity ?? item?.quantityMt ?? ""));
  const [deliveryDate, setDeliveryDate] = useState(
    last?.deliveryDate ?? item?.requestedDeliveryDate ?? "",
  );
  const [paymentTerms, setPaymentTerms] = useState(
    last?.paymentTerms ?? item?.paymentTerms ?? "LC 45",
  );
  const [message, setMessage] = useState("");

  if (!item) {
    return (
      <OperationsShell title="Negotiation" subtitle="Record not found.">
        <EmptyState
          title="Procurement record not found"
          action={
            <Button asChild>
              <Link href={ROUTES.PROCUREMENT_NEGOTIATION}>Back</Link>
            </Button>
          }
        />
      </OperationsShell>
    );
  }

  if (isSeller && sellerId && !item.assignedSellers?.some((row) => row.supplierId === sellerId) && item.supplierId !== sellerId) {
    return (
      <OperationsShell title="Negotiation" subtitle="Not assigned">
        <EmptyState title="This RFQ is not assigned to your company." />
      </OperationsShell>
    );
  }

  const ownOffers = sellerVisibleOffers(item, isSeller ? sellerId : undefined);
  const initial = ownOffers[0]?.unitPrice ?? item.negotiation[0]?.unitPrice ?? item.unitPrice;
  const currentTotal = Math.round((last?.unitPrice ?? item.unitPrice) * item.quantityMt);

  const submit = (asSeller: boolean) => {
    const price = Number(unitPrice);
    const qty = Number(quantity);
    if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(qty) || qty <= 0) {
      toast.error("Unit price and quantity must be numeric.");
      return;
    }
    if (item.status !== "NEGOTIATION") startNegotiation(item.requestId);
    const payload = {
      unitPrice: price,
      quantity: qty,
      deliveryDate: deliveryDate || item.requestedDeliveryDate,
      paymentTerms,
      message,
    };
    if (asSeller) sellerCounterOffer(item.requestId, payload);
    else sendCounterOffer(item.requestId, payload);
    setMessage("");
    toast.success("Counter offer submitted.");
  };

  return (
    <OperationsShell
      title={`Negotiation · ${item.requestId}`}
      subtitle={`${item.commodity} ${item.grade} · ${isSeller ? "PetroTrade commercial desk" : item.supplier}`}
      actions={
        <>
          <OpsStatusBadge status={item.negotiationStatus ?? item.status} />
          <Button variant="outline" asChild>
            <Link href={`${ROUTES.PROCUREMENT_PURCHASE_REQUESTS}/${item.requestId}`}>
              Back to PR
            </Link>
          </Button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Material information</h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-4 text-sm">
              <div>
                <dt className="text-slate-500">Buyer</dt>
                <dd className="font-medium">{isSeller ? "PetroTrade (on behalf of customer)" : item.buyer}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Quantity</dt>
                <dd className="font-medium">
                  {formatNumber(item.quantityMt)} {item.quantityUnit}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Delivery</dt>
                <dd className="font-medium">{item.requestedDeliveryDate}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Payment</dt>
                <dd className="font-medium">{item.paymentTerms}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-violet-100 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Negotiation history</h2>
            <div className="mt-4 space-y-3">
              {item.negotiation.length === 0 ? (
                <p className="text-sm text-slate-500">No messages yet.</p>
              ) : (
                item.negotiation.map((row) => (
                  <div
                    key={row.id}
                    className={
                      row.actor === "ADMIN"
                        ? "ml-8 rounded-lg border border-blue-100 bg-[#F5F9FF] p-3"
                        : "mr-8 rounded-lg border border-violet-100 bg-violet-50 p-3"
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-700">
                        {row.actor === "ADMIN" ? "Admin" : "Seller"}: ₹
                        {formatNumber(row.unitPrice)}/MT
                      </p>
                      <span className="text-[11px] text-slate-400">
                        {formatDateTime(row.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700">{row.message}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="h-fit rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Commercial panel</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Seller initial quote</dt>
              <dd className="font-medium">₹{formatNumber(initial)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Current negotiated price</dt>
              <dd className="font-medium">₹{formatNumber(last?.unitPrice ?? item.unitPrice)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Total value</dt>
              <dd className="font-medium">{formatCompactInr(currentTotal)}</dd>
            </div>
          </dl>
          <div className="mt-4 space-y-3">
            <div>
              <Label>Counter price / MT</Label>
              <Input className="mt-1.5" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input className="mt-1.5" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div>
              <Label>Delivery date</Label>
              <Input className="mt-1.5" type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
            </div>
            <div>
              <Label>Payment terms</Label>
              <Input className="mt-1.5" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea className="mt-1.5" value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            {isAdmin ? (
              <>
                <Button className="w-full bg-[#1B6EF3] hover:bg-[#1558C8]" onClick={() => submit(false)}>
                  Send Counter Offer
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    finalizeNegotiation(item.requestId);
                    toast.success("Negotiation completed. Moved to approval.");
                  }}
                >
                  Finalize Price
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    finalizeNegotiation(item.requestId);
                    toast.success("Seller quote accepted.");
                  }}
                >
                  Accept Seller Quote
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-red-600"
                  onClick={() => {
                    const offerId = item.offers.find((row) => row.status !== "REJECTED")?.id;
                    if (offerId) rejectOffer(item.requestId, offerId);
                    toast.success("Quote rejected.");
                  }}
                >
                  Reject Quote
                </Button>
              </>
            ) : (
              <>
                <Button className="w-full bg-[#1B6EF3] hover:bg-[#1558C8]" onClick={() => submit(true)}>
                  Counter Offer
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    sellerAcceptPrice(item.requestId);
                    toast.success("Price accepted.");
                  }}
                >
                  Accept Price
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-red-600"
                  onClick={() => toast.success("Price rejected. Admin has been notified.")}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        </section>
      </div>
    </OperationsShell>
  );
}
