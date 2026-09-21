"use client";

import { Receipt } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PETROTRADE_CREDIT_NOTE } from "@/lib/seller/payment";
import type { ProductPricing } from "@/types/products";

interface PricingCardProps {
  pricing: ProductPricing;
  onChange: (data: Partial<ProductPricing>) => void;
  errors?: Record<string, string>;
}

export function PricingCard({ pricing, onChange, errors }: PricingCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
      <div className="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-4">
        <Receipt className="h-4 w-4 text-[#0B1F3A]" />
        <h3 className="text-sm font-semibold text-slate-800">Selling Price (₹/MT)</h3>
      </div>

      <div className="space-y-2">
        <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Selling Price
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
            value={pricing.sellingPrice || ""}
            onChange={(e) =>
              onChange({ sellingPrice: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
        {errors?.sellingPrice || errors?.["pricing.sellingPrice"] ? (
          <p className="text-xs text-red-500">
            {errors.sellingPrice || errors["pricing.sellingPrice"]}
          </p>
        ) : null}
        <p className="text-xs text-slate-500">{PETROTRADE_CREDIT_NOTE}</p>
      </div>
    </div>
  );
}
