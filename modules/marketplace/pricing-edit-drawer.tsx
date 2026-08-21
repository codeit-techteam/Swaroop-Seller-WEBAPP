"use client";

import { TrendingUp } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { CxFormDrawer } from "@/components/cx";
import { OpsStatusBadge } from "@/components/operations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { marginOf } from "@/lib/cx";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import type { CatalogProduct } from "@/types/marketplace-cms";

function marginTone(pct: number) {
  if (pct < 5) return "text-red-600";
  if (pct < 8) return "text-amber-600";
  return "text-emerald-700";
}

function marginBg(pct: number) {
  if (pct < 5) return "border-red-100 bg-red-50";
  if (pct < 8) return "border-amber-100 bg-amber-50";
  return "border-emerald-100 bg-emerald-50";
}

interface PricingEditDrawerProps {
  open: boolean;
  product: CatalogProduct | null;
  onClose: () => void;
  onSave: (
    product: CatalogProduct,
    values: {
      sellingPrice: number;
      internalCost: number;
      deliveryCharge: number;
    },
  ) => Promise<void>;
}

export function PricingEditDrawer({
  open,
  product,
  onClose,
  onSave,
}: PricingEditDrawerProps) {
  const [selling, setSelling] = useState("");
  const [cost, setCost] = useState("");
  const [freight, setFreight] = useState("");
  const [saving, setSaving] = useState(false);
  const [syncedProductId, setSyncedProductId] = useState<string | null>(null);

  // Adjust local draft when the edited product changes (render-time sync).
  if (open && product && product.id !== syncedProductId) {
    setSyncedProductId(product.id);
    setSelling(String(product.sellingPrice));
    setCost(String(product.internalCost));
    setFreight(String(product.deliveryCharge));
  }
  if (!open && syncedProductId !== null) {
    setSyncedProductId(null);
  }

  if (!product) return null;

  const current = marginOf(product);
  const draftSell = Number(selling) || 0;
  const draftCost = Number(cost) || 0;
  const draftFreight = Number(freight) || 0;
  const draftMargin = draftSell - draftCost;
  const draftPct = draftSell ? (draftMargin / draftSell) * 100 : 0;
  const vsMarket =
    product.marketPrice > 0
      ? ((draftSell - product.marketPrice) / product.marketPrice) * 100
      : 0;
  const dirty =
    draftSell !== product.sellingPrice ||
    draftCost !== product.internalCost ||
    draftFreight !== product.deliveryCharge;

  return (
    <CxFormDrawer
      open={open}
      onClose={onClose}
      title="Update pricing"
      description="Customers see selling price only. Cost and margin stay internal until approved."
      submitLabel={saving ? "Saving…" : "Save for approval"}
      submitting={saving || !dirty}
      widthClassName="w-full max-w-lg"
      onSubmit={() => {
        if (!draftSell) {
          toast.error("Selling price is required");
          return;
        }
        setSaving(true);
        void onSave(product, {
          sellingPrice: draftSell,
          internalCost: draftCost,
          deliveryCharge: draftFreight,
        })
          .then(() => onClose())
          .finally(() => setSaving(false));
      }}
    >
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {product.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {product.location} · {product.sku}
            </p>
          </div>
          <OpsStatusBadge status={product.publishStatus} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Current sell
            </p>
            <p className="mt-0.5 tabular-nums font-medium text-slate-800">
              {formatCurrency(product.sellingPrice)}
              <span className="ml-1 text-xs font-normal text-slate-400">
                / {product.unit}
              </span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Market
            </p>
            <p className="mt-0.5 tabular-nums font-medium text-slate-800">
              {formatCurrency(product.marketPrice)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-1">
          <Label htmlFor="pricing-selling">Selling price</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              ₹
            </span>
            <Input
              id="pricing-selling"
              type="number"
              min={0}
              step="1"
              value={selling}
              onChange={(e) => setSelling(e.target.value)}
              className="h-10 pl-7 tabular-nums"
            />
          </div>
          <p className="text-[11px] text-slate-400">per {product.unit}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pricing-cost">Internal cost</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              ₹
            </span>
            <Input
              id="pricing-cost"
              type="number"
              min={0}
              step="1"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="h-10 pl-7 tabular-nums"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pricing-freight">Freight</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              ₹
            </span>
            <Input
              id="pricing-freight"
              type="number"
              min={0}
              step="1"
              value={freight}
              onChange={(e) => setFreight(e.target.value)}
              className="h-10 pl-7 tabular-nums"
            />
          </div>
        </div>
      </div>

      <div
        className={cn(
          "rounded-xl border p-4 transition-colors",
          marginBg(draftPct),
        )}
      >
        <div className="flex items-center gap-2">
          <TrendingUp className={cn("h-4 w-4", marginTone(draftPct))} />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Draft margin
          </p>
        </div>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p
              className={cn(
                "text-2xl font-bold tabular-nums tracking-tight",
                marginTone(draftPct),
              )}
            >
              {formatCurrency(draftMargin)}
            </p>
            <p
              className={cn(
                "mt-0.5 text-sm font-semibold",
                marginTone(draftPct),
              )}
            >
              {formatPercentage(draftPct)} margin
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>
              Was {formatCurrency(current.margin)} ·{" "}
              {formatPercentage(current.pct)}
            </p>
            <p className="mt-0.5">
              vs market{" "}
              <span
                className={cn(
                  "font-medium",
                  vsMarket > 0
                    ? "text-emerald-700"
                    : vsMarket < 0
                      ? "text-red-600"
                      : "text-slate-600",
                )}
              >
                {vsMarket > 0 ? "+" : ""}
                {vsMarket.toFixed(1)}%
              </span>
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-slate-500">
        Saving sends this SKU to{" "}
        <span className="font-medium text-slate-700">pending approval</span>.
        Bulk tier prices scale with the selling-price change.
      </p>
    </CxFormDrawer>
  );
}
