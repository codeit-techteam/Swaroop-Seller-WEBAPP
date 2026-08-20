"use client";

import { Receipt } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import type { ProductPricing } from "@/types/products";

interface PricingCardProps {
  pricing: ProductPricing;
  onChange: (data: Partial<ProductPricing>) => void;
  errors?: Record<string, string>;
}

function PriceInput({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
          ₹
        </span>
        <Input
          type="number"
          min={0}
          step="0.01"
          className="pl-7"
          value={value || ""}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
      </div>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

export function PricingCard({ pricing, onChange, errors }: PricingCardProps) {
  const onDeliveryCalc =
    pricing.onDelivery ||
    pricing.basePrice + pricing.advancePrice + pricing.onLoading;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
      <div className="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-4">
        <Receipt className="h-4 w-4 text-[#0B1F3A]" />
        <h3 className="text-sm font-semibold text-slate-800">Pricing (₹/MT)</h3>
      </div>

      <div className="space-y-5">
        <PriceInput
          label="Base Price"
          value={pricing.basePrice}
          onChange={(val) => onChange({ basePrice: val })}
          error={errors?.basePrice}
        />

        <div className="grid grid-cols-2 gap-4">
          <PriceInput
            label="Advance Payment"
            value={pricing.advancePrice}
            onChange={(val) => onChange({ advancePrice: val })}
          />
          <PriceInput
            label="On Loading"
            value={pricing.onLoading}
            onChange={(val) => onChange({ onLoading: val })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <PriceInput
            label="Credit 15 Days"
            value={pricing.credit15Days}
            onChange={(val) => onChange({ credit15Days: val })}
          />
          <PriceInput
            label="Credit 30 Days"
            value={pricing.credit30Days}
            onChange={(val) => onChange({ credit30Days: val })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            On Delivery Price
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              ₹
            </span>
            <Input
              type="number"
              min={0}
              step="0.01"
              className="pl-7"
              value={onDeliveryCalc || ""}
              onChange={(e) =>
                onChange({ onDelivery: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
          <p className="text-xs text-slate-400">
            Calculated: {formatCurrency(onDeliveryCalc)}
          </p>
        </div>
      </div>
    </div>
  );
}
