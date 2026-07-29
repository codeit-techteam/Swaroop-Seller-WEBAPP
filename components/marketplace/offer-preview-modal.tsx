"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Package, Warehouse, X } from "lucide-react";

import { OfferStatusBadge } from "@/components/marketplace/offer-status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { Offer } from "@/types/offers";

const paymentLabels: Record<string, string> = {
  advance: "Advance",
  on_loading: "On Loading",
  on_delivery: "On Delivery",
  credit_15: "15 Days Credit",
  credit_30: "30 Days Credit",
};

interface OfferPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: Offer | null;
  fullscreen?: boolean;
}

export function OfferPreviewModal({
  open,
  onOpenChange,
  offer,
  fullscreen = false,
}: OfferPreviewModalProps) {
  if (!offer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          fullscreen
            ? "max-h-[95vh] max-w-5xl overflow-y-auto p-0"
            : "max-h-[90vh] max-w-3xl overflow-y-auto p-0"
        }
      >
        <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-500">
                Buyer Preview
              </p>
              <DialogTitle className="text-xl font-bold text-[#0B1F3A]">
                {offer.productName}
              </DialogTitle>
              <p className="text-sm text-slate-500">
                {offer.productGrade} · {offer.offerId}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 p-6"
        >
          <div className="flex flex-wrap items-center gap-3">
            <OfferStatusBadge status={offer.status} />
            <span className="text-sm text-slate-500">
              {offer.visibility ? "Published" : "Hidden"}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <Package className="mb-2 h-5 w-5 text-[#1B6EF3]" />
              <p className="text-xs text-slate-500">Pricing</p>
              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(offer.basePrice)}
                <span className="text-sm font-normal text-slate-400">/MT</span>
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <Warehouse className="mb-2 h-5 w-5 text-[#1B6EF3]" />
              <p className="text-xs text-slate-500">Warehouse</p>
              <p className="text-sm font-semibold text-slate-800">
                {offer.warehouseName}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <Calendar className="mb-2 h-5 w-5 text-[#1B6EF3]" />
              <p className="text-xs text-slate-500">Validity</p>
              <p className="text-sm font-semibold text-slate-800">
                {offer.validUntil || "—"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <MapPin className="mb-2 h-5 w-5 text-[#1B6EF3]" />
              <p className="text-xs text-slate-500">Inventory</p>
              <p className="text-sm font-semibold text-slate-800">
                {formatNumber(offer.availableInventoryMt, {
                  maximumFractionDigits: 2,
                })}{" "}
                MT available
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">MOQ</p>
              <p className="text-lg font-bold text-slate-900">{offer.moq} MT</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Allocation</p>
              <p className="text-lg font-bold text-slate-900">
                {offer.allocationMt || offer.quantityMt} MT
              </p>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-800">
              Bulk Pricing
            </h4>
            <div className="grid gap-3 sm:grid-cols-3">
              {offer.tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="rounded-lg border border-slate-200 p-3"
                >
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    {tier.label}
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {formatCurrency(tier.unitPrice)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {tier.discountPercent}% off
                  </p>
                  {tier.savingsPerMt > 0 ? (
                    <p className="text-xs text-emerald-600">
                      Save {formatCurrency(tier.savingsPerMt)}/MT
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-slate-800">
              Payment Terms
            </h4>
            <div className="flex flex-wrap gap-2">
              {offer.paymentTerms.map((term) => (
                <span
                  key={term}
                  className="rounded-full bg-[#0B1F3A] px-3 py-1 text-xs font-medium text-white"
                >
                  {paymentLabels[term] ?? term}
                </span>
              ))}
            </div>
          </div>

          {offer.remarks ? (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-800">
                Remarks
              </h4>
              <p className="text-sm text-slate-500">{offer.remarks}</p>
            </div>
          ) : null}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
