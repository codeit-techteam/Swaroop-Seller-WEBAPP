"use client";

import { ArrowDownRight, ArrowUpRight, Package } from "lucide-react";
import Link from "next/link";

import { DetailDrawer } from "@/components/drawers/detail-drawer";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { availableToSell, formatMt } from "@/lib/seller/format";
import { inventoryStatus, warehouseForProduct } from "@/lib/seller/inventory";
import { cn, formatRelativeTime } from "@/lib/utils";
import type {
  SellerLocation,
  SellerProduct,
  StockAdjustment,
} from "@/types/seller";

import { StockBarLegend, StockCompositionBar } from "./stock-bar";

export function InventoryDetailDrawer({
  product,
  location,
  movements,
  onOpenChange,
  onAdjust,
}: {
  product: SellerProduct | null;
  location?: SellerLocation;
  movements: StockAdjustment[];
  onOpenChange: (open: boolean) => void;
  onAdjust: () => void;
}) {
  const status = product ? inventoryStatus(product) : "IN_STOCK";
  const sellable = product
    ? availableToSell(
        product.availableStock,
        product.reservedStock,
        product.committedStock,
      )
    : 0;

  return (
    <DetailDrawer
      open={Boolean(product)}
      onOpenChange={onOpenChange}
      title={product?.gradeName ?? "Inventory"}
      footer={
        product ? (
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-[#0B1F3A] hover:bg-[#122846]"
              onClick={onAdjust}
            >
              Update stock
            </Button>
            <Button className="flex-1" variant="outline" asChild>
              <Link href={`${ROUTES.OFFERS_NEW}?productId=${product.id}`}>
                Create offer
              </Link>
            </Button>
          </div>
        ) : null
      }
    >
      {product ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FF] text-[#1B6EF3]">
              <Package className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-900">
                  {product.gradeName}
                </p>
                <SellerStatusBadge status={status} />
              </div>
              <p className="mt-0.5 text-sm text-slate-500">
                {product.gradeCode} · {product.category}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {product.manufacturer}
                {product.origin ? ` · ${product.origin}` : ""}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "On hand", value: formatMt(product.availableStock) },
              {
                label: "Sellable",
                value: formatMt(sellable),
                accent: true,
              },
              { label: "Reserved", value: formatMt(product.reservedStock) },
              { label: "Committed", value: formatMt(product.committedStock) },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5"
              >
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  {item.label}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-sm font-semibold",
                    item.accent ? "text-[#1B6EF3]" : "text-slate-900",
                  )}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">
                Stock composition
              </p>
              <StockBarLegend />
            </div>
            <StockCompositionBar product={product} />
          </div>

          <div className="rounded-xl bg-[#0B1F3A] p-4 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Warehouse
            </p>
            <p className="mt-1 text-sm font-semibold">
              {warehouseForProduct(product, location)}
            </p>
            <p className="mt-1 text-xs text-slate-300">
              {location
                ? `${location.city}, ${location.state}`
                : "Location not assigned"}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-slate-400">MOQ</p>
                <p className="font-semibold">{formatMt(product.moq)}</p>
              </div>
              <div>
                <p className="text-slate-400">Unit</p>
                <p className="font-semibold">{product.unit}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">
              Recent movements
            </h4>
            {movements.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-500">
                No stock movements recorded yet.
              </p>
            ) : (
              <ol className="space-y-3">
                {movements.map((item) => {
                  const added = item.delta >= 0;
                  return (
                    <li key={item.id} className="flex gap-3">
                      <span
                        className={cn(
                          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                          added
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-700",
                        )}
                      >
                        {added ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-800">
                            {item.reason}
                          </p>
                          <p
                            className={cn(
                              "text-sm font-semibold tabular-nums",
                              added ? "text-emerald-700" : "text-amber-700",
                            )}
                          >
                            {added ? "+" : ""}
                            {formatMt(item.delta)}
                          </p>
                        </div>
                        <p className="text-xs text-slate-400">
                          {formatRelativeTime(item.at)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      ) : null}
    </DetailDrawer>
  );
}
