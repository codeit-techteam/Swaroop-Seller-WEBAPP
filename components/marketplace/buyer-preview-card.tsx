"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Calendar,
  FlaskConical,
  MapPin,
  Package,
} from "lucide-react";

import { formatCurrency, formatNumber } from "@/lib/utils";
import type { OfferFormData, PricingTier } from "@/types/offers";
import { computeLivePricing } from "@/types/offers";

const paymentLabels: Record<string, string> = {
  advance: "Advance",
  on_loading: "On Loading",
  on_delivery: "On Delivery",
  credit_15: "15 Days Credit",
  credit_30: "30 Days Credit",
};

function formatTierRange(tier: PricingTier): string {
  if (tier.maxQty === null) return `${tier.minQty}+ MT`;
  return `${tier.minQty}–${tier.maxQty} MT`;
}

interface BuyerPreviewCardProps {
  formData: OfferFormData;
}

export function BuyerPreviewCard({ formData }: BuyerPreviewCardProps) {
  const stats = computeLivePricing(formData);
  const hasProduct = Boolean(formData.productId);

  return (
    <motion.aside
      layout
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-20 space-y-4"
    >
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
        <div className="border-b border-slate-100 bg-gradient-to-br from-[#0B1F3A] to-[#1B6EF3] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-100">
            Live Buyer Preview
          </p>
          <p className="mt-0.5 text-sm font-medium text-white">
            How buyers will see this offer
          </p>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <FlaskConical className="h-6 w-6 text-[#1B6EF3]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">
                {hasProduct ? formData.productName : "Select a product"}
              </p>
              <p className="text-xs text-slate-400">
                {formData.productGrade || "—"}
              </p>
              {stats.maxDiscount > 0 ? (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <BadgeCheck className="h-3 w-3" />
                  Lowest Landed Cost
                </span>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              From
            </p>
            <p className="mt-1 text-2xl font-bold text-[#0B1F3A]">
              {formatCurrency(stats.buyerVisiblePrice || formData.basePrice)}
              <span className="text-sm font-normal text-slate-400">/MT</span>
            </p>
            {formData.basePrice > 0 &&
            stats.buyerVisiblePrice < formData.basePrice ? (
              <p className="text-xs text-slate-400 line-through">
                {formatCurrency(formData.basePrice)}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <Package className="mb-1.5 h-3.5 w-3.5 text-slate-400" />
              <p className="text-slate-400">MOQ</p>
              <p className="font-semibold text-slate-800">
                {formData.moq || 0} MT
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <MapPin className="mb-1.5 h-3.5 w-3.5 text-slate-400" />
              <p className="text-slate-400">Warehouse</p>
              <p className="truncate font-semibold text-slate-800">
                {formData.warehouseName || "—"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <Calendar className="mb-1.5 h-3.5 w-3.5 text-slate-400" />
              <p className="text-slate-400">Valid Until</p>
              <p className="font-semibold text-slate-800">
                {formData.validUntil || "—"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <Package className="mb-1.5 h-3.5 w-3.5 text-slate-400" />
              <p className="text-slate-400">Allocation</p>
              <p className="font-semibold text-slate-800">
                {formatNumber(formData.allocationMt || 0, {
                  maximumFractionDigits: 2,
                })}{" "}
                MT
              </p>
            </div>
          </div>

          {formData.tiers.length > 0 ? (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Bulk Tiers
              </p>
              <div className="space-y-1.5">
                {formData.tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-2.5 py-1.5 text-xs"
                  >
                    <span className="text-slate-500">
                      {formatTierRange(tier)}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(tier.unitPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {formData.paymentTerms.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {formData.paymentTerms.map((term) => (
                <span
                  key={term}
                  className="rounded-full bg-[#0B1F3A] px-2 py-0.5 text-[10px] font-medium text-white"
                >
                  {paymentLabels[term] ?? term}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </motion.aside>
  );
}
