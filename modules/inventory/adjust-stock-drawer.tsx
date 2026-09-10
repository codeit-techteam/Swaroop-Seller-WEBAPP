"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { DetailDrawer } from "@/components/drawers/detail-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { availableToSell, formatMt } from "@/lib/seller/format";
import {
  STOCK_ADJUSTMENT_REASONS,
  type StockAdjustmentReason,
} from "@/lib/seller/inventory";
import { cn } from "@/lib/utils";
import type { SellerProduct } from "@/types/seller";

type AdjustMode = "add" | "reduce";

export function AdjustStockDrawer({
  open,
  product,
  products,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  product: SellerProduct | null;
  products: SellerProduct[];
  onOpenChange: (open: boolean) => void;
  onSave: (productId: string, delta: number, reason: string) => void;
}) {
  const [selectedId, setSelectedId] = useState(
    product?.id ?? products[0]?.id ?? "",
  );
  const [mode, setMode] = useState<AdjustMode>("add");
  const [qty, setQty] = useState("20");
  const [reason, setReason] =
    useState<StockAdjustmentReason>("New Procurement");

  const selected =
    products.find((item) => item.id === selectedId) ?? product ?? null;

  const qtyValue = Math.max(0, Number(qty) || 0);
  const delta = mode === "add" ? qtyValue : -qtyValue;

  const preview = useMemo(() => {
    if (!selected) return null;
    const nextAvailable = Math.max(0, selected.availableStock + delta);
    return {
      available: nextAvailable,
      sellable: availableToSell(
        nextAvailable,
        selected.reservedStock,
        selected.committedStock,
      ),
    };
  }, [delta, selected]);

  const overAllocated =
    Boolean(selected) &&
    mode === "reduce" &&
    qtyValue > (selected?.availableStock ?? 0);

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Update stock"
      footer={
        <Button
          className="w-full bg-[#0B1F3A] hover:bg-[#122846]"
          disabled={!selected || qtyValue <= 0}
          onClick={() => {
            if (!selected || qtyValue <= 0) return;
            onSave(selected.id, delta, reason);
            toast.success(
              `${selected.gradeName} ${mode === "add" ? "increased" : "reduced"} by ${formatMt(qtyValue)}`,
            );
            onOpenChange(false);
          }}
        >
          Save adjustment
        </Button>
      }
    >
      <div className="space-y-5">
        <div>
          <Label htmlFor="grade">Grade</Label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger id="grade" className="mt-1">
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {products.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.gradeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selected ? (
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                On hand
              </p>
              <p className="font-semibold">
                {formatMt(selected.availableStock)}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Sellable
              </p>
              <p className="font-semibold text-[#1B6EF3]">
                {formatMt(
                  availableToSell(
                    selected.availableStock,
                    selected.reservedStock,
                    selected.committedStock,
                  ),
                )}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Reserved
              </p>
              <p className="font-semibold">
                {formatMt(selected.reservedStock)}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Committed
              </p>
              <p className="font-semibold">
                {formatMt(selected.committedStock)}
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          {(["add", "reduce"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                mode === item
                  ? item === "add"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              {item === "add" ? "Add stock" : "Reduce stock"}
            </button>
          ))}
        </div>

        <div>
          <Label htmlFor="qty">Quantity (MT)</Label>
          <Input
            id="qty"
            type="number"
            min="0"
            step="1"
            className="mt-1"
            value={qty}
            onChange={(event) => setQty(event.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="reason">Reason</Label>
          <Select
            value={reason}
            onValueChange={(value) => setReason(value as StockAdjustmentReason)}
          >
            <SelectTrigger id="reason" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STOCK_ADJUSTMENT_REASONS.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {preview && selected ? (
          <div className="rounded-xl border border-[#1B6EF3]/20 bg-[#F5F9FF] p-3 text-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1B6EF3]">
              After save
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-slate-500">On hand</span>
              <span className="font-semibold">
                {formatMt(selected.availableStock)} →{" "}
                {formatMt(preview.available)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-slate-500">Sellable</span>
              <span className="font-semibold text-[#1B6EF3]">
                {formatMt(preview.sellable)}
              </span>
            </div>
            {overAllocated ? (
              <p className="mt-2 text-xs text-amber-700">
                Reduction exceeds on-hand quantity. Stock will be floored at 0
                MT.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </DetailDrawer>
  );
}
