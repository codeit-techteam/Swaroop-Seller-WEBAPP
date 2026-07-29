"use client";

import { formatCurrency } from "@/lib/utils";
import type { PriceRevisionRequest } from "@/types/price-revision";

interface OfferDetailsCardProps {
  request: PriceRevisionRequest;
}

function formatPrice(value: number): string {
  return `${formatCurrency(value, { currency: "INR" }).replace(/\.00$/, "")}/MT`;
}

export function OfferDetailsCard({ request }: OfferDetailsCardProps) {
  const items = [
    { label: "Product", value: request.productName },
    { label: "Warehouse", value: request.warehouseLabel },
    { label: "Current Price", value: formatPrice(request.currentPrice) },
    {
      label: "Inventory",
      value: `${request.inventoryMt.toLocaleString("en-IN")} MT`,
    },
    { label: "Batch Number", value: request.batchNumber },
    { label: "Offer Validity", value: request.offerValidity },
    { label: "MOQ", value: `${request.moq} MT` },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Current Offer Details
      </h4>
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {item.label}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
