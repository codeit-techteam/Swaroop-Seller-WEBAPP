"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Package } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { OfferStatusBadge } from "@/components/marketplace";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { useOfferStore } from "@/store/offerStore";

const paymentLabels: Record<string, string> = {
  advance: "Advance",
  on_loading: "On Loading",
  on_delivery: "On Delivery",
  credit_15: "15 Days Credit",
  credit_30: "30 Days Credit",
};

export function PreviewOfferView() {
  const params = useParams();
  const id = params.id as string;
  const offer = useOfferStore((s) => s.getOfferById(id));
  const loadOfferForEdit = useOfferStore((s) => s.loadOfferForEdit);

  useEffect(() => {
    if (id) loadOfferForEdit(id);
  }, [id, loadOfferForEdit]);

  if (!offer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-slate-600">Offer not found</p>
        <Button asChild className="mt-4">
          <Link href={ROUTES.OFFERS}>Back to Offers</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-500">
            Buyer Preview
          </p>
          <h1 className="text-2xl font-bold text-[#0B1F3A]">
            {offer.productName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{offer.offerId}</p>
        </div>
        <OfferStatusBadge status={offer.status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <Package className="mb-2 h-5 w-5 text-[#1B6EF3]" />
          <p className="text-xs text-slate-500">Base Price</p>
          <p className="text-xl font-bold text-slate-900">
            {formatCurrency(offer.basePrice)}
            <span className="text-sm font-normal text-slate-400">/MT</span>
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <MapPin className="mb-2 h-5 w-5 text-[#1B6EF3]" />
          <p className="text-xs text-slate-500">Warehouse</p>
          <p className="text-sm font-semibold text-slate-800">
            {offer.warehouseName}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <Calendar className="mb-2 h-5 w-5 text-[#1B6EF3]" />
          <p className="text-xs text-slate-500">Valid Until</p>
          <p className="text-sm font-semibold text-slate-800">
            {offer.validUntil}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="mb-3 text-sm font-semibold text-slate-800">
          Bulk Pricing Tiers
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
              {tier.savingsPerMt > 0 ? (
                <p className="text-xs text-emerald-600">
                  Save {formatCurrency(tier.savingsPerMt)}/MT
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
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
        <p className="mt-4 text-sm text-slate-600">
          MOQ: {offer.moq} MT · Available: {offer.quantityMt} MT
        </p>
        {offer.remarks ? (
          <p className="mt-2 text-sm text-slate-500">{offer.remarks}</p>
        ) : null}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href={ROUTES.OFFERS}>Back to Offers</Link>
        </Button>
        <Button asChild className="bg-[#0B1F3A]">
          <Link href={`${ROUTES.OFFERS_EDIT}/${offer.id}`}>Edit Offer</Link>
        </Button>
      </div>
    </motion.div>
  );
}
