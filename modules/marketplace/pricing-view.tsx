"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  BadgeIndianRupee,
  Clock3,
  Pencil,
  Percent,
  TrendingDown,
} from "lucide-react";

import {
  OperationsShell,
  OpsStatusBadge,
  OpsTable,
} from "@/components/operations";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { CURRENT_USER } from "@/config";
import { isSellerRole } from "@/config/roles";
import { useClientTable } from "@/hooks/useClientTable";
import { marginOf } from "@/lib/cx";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { PricingEditDrawer } from "@/modules/marketplace/pricing-edit-drawer";
import { useAuthStore } from "@/store/authStore";
import { useMarketplaceCmsStore } from "@/store/marketplaceCmsStore";
import type { CatalogProduct } from "@/types/marketplace-cms";

function marginTone(pct: number) {
  if (pct < 5) return "text-red-600";
  if (pct < 8) return "text-amber-600";
  return "text-emerald-700";
}

function formatTierSummary(product: CatalogProduct) {
  if (!product.bulkPrices?.length) return "Spot only";
  const sorted = [...product.bulkPrices].sort((a, b) => a.minQty - b.minQty);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) return "Spot only";
  if (sorted.length === 1) {
    return `${first.minQty}+ ${product.unit}`;
  }
  return `${sorted.length} tiers · ${first.minQty}–${last.maxQty ?? "∞"} ${product.unit}`;
}

function vsMarketLabel(selling: number, market: number) {
  if (!market) return null;
  const delta = ((selling - market) / market) * 100;
  const sign = delta > 0 ? "+" : "";
  return {
    text: `${sign}${delta.toFixed(1)}% vs mkt`,
    tone:
      delta > 1
        ? "text-emerald-600"
        : delta < -1
          ? "text-red-600"
          : "text-slate-400",
  };
}

export function PricingView() {
  const products = useMarketplaceCmsStore((s) => s.products);
  const upsertProduct = useMarketplaceCmsStore((s) => s.upsertProduct);
  const role = useAuthStore((s) => s.user?.role ?? CURRENT_USER.role);
  const showInternal = !isSellerRole(role);
  const [editing, setEditing] = useState<CatalogProduct | null>(null);

  const searchFields = useMemo(
    () => (row: CatalogProduct) => [row.name, row.grade, row.location, row.sku],
    [],
  );
  const table = useClientTable({
    rows: products,
    searchFields,
    getStatus: (row) => row.publishStatus,
  });

  const liveCount = products.filter((p) => p.publishStatus === "LIVE").length;
  const pendingCount = products.filter(
    (p) => p.publishStatus === "PENDING_APPROVAL",
  ).length;
  const lowMarginCount = products.filter((p) => marginOf(p).pct < 5).length;
  const avgMargin =
    products.length === 0
      ? 0
      : products.reduce((sum, p) => sum + marginOf(p).pct, 0) / products.length;

  const headers = showInternal
    ? [
        "Product",
        "Selling",
        "Margin",
        "Bulk tiers",
        "Logistics",
        "Effective",
        "Status",
        "Actions",
      ]
    : [
        "Product",
        "Selling",
        "Market",
        "Bulk tiers",
        "Logistics",
        "Effective",
        "Status",
      ];

  return (
    <OperationsShell
      title="Customer pricing"
      subtitle="Scan live prices at a glance. Open a row to revise selling, cost, or freight — changes go to approval before customers see them."
      kpis={
        showInternal
          ? [
              {
                title: "Live SKUs",
                value: liveCount,
                icon: BadgeIndianRupee,
                accent: "blue" as const,
                hint: "Visible customer prices",
              },
              {
                title: "Avg margin",
                value: avgMargin,
                suffix: "%",
                decimals: 1,
                icon: Percent,
                accent: "emerald" as const,
                hint: "Across catalog",
              },
              {
                title: "Pending",
                value: pendingCount,
                icon: Clock3,
                accent: "amber" as const,
                hint: "Awaiting approval",
              },
              {
                title: "Low margin",
                value: lowMarginCount,
                icon: TrendingDown,
                accent: "rose" as const,
                hint: "Under 5%",
              },
            ]
          : undefined
      }
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search grade, location or SKU"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={["ALL", "LIVE", "DRAFT", "PAUSED", "PENDING_APPROVAL"]}
        headers={headers}
        emptyTitle="No prices"
        emptyDescription="Publish a product to manage customer-facing price."
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.filtered.length}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        rowCount={table.paginated.length}
      >
        {table.paginated.map((row) => {
          const { margin, pct } = marginOf(row);
          const marketDelta = vsMarketLabel(row.sellingPrice, row.marketPrice);
          const paymentOptions = row.paymentTerms.filter(
            (term) => term.enabled,
          ).length;

          return (
            <TableRow
              key={row.id}
              className={cn(
                "align-middle transition-colors",
                showInternal && "hover:bg-slate-50/80",
              )}
            >
              <TableCell>
                <div className="min-w-[180px]">
                  <p className="font-medium text-slate-900">{row.name}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {row.location} · {row.sku}
                  </p>
                </div>
              </TableCell>

              <TableCell>
                <p className="tabular-nums text-base font-semibold tracking-tight text-slate-900">
                  {formatCurrency(row.sellingPrice)}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  / {row.unit}
                  {marketDelta && showInternal ? (
                    <span className={cn("ml-1.5", marketDelta.tone)}>
                      {marketDelta.text}
                    </span>
                  ) : null}
                </p>
              </TableCell>

              {showInternal ? (
                <TableCell>
                  <p
                    className={cn(
                      "tabular-nums text-sm font-semibold",
                      marginTone(pct),
                    )}
                  >
                    {formatPercentage(pct)}
                  </p>
                  <p className="mt-0.5 tabular-nums text-[11px] text-slate-500">
                    {formatCurrency(margin)}
                    <span className="text-slate-400">
                      {" "}
                      · cost {formatCurrency(row.internalCost)}
                    </span>
                  </p>
                </TableCell>
              ) : (
                <TableCell className="tabular-nums text-slate-600">
                  {formatCurrency(row.marketPrice)}
                </TableCell>
              )}

              <TableCell>
                <p className="text-sm text-slate-700">
                  {formatTierSummary(row)}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {paymentOptions} payment option
                  {paymentOptions === 1 ? "" : "s"}
                </p>
              </TableCell>

              <TableCell>
                <p className="tabular-nums text-sm text-slate-700">
                  Freight {formatCurrency(row.deliveryCharge)}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  MOQ {row.moq} {row.unit}
                </p>
              </TableCell>

              <TableCell className="whitespace-nowrap text-sm text-slate-600">
                {row.effectiveDate}
              </TableCell>

              <TableCell>
                <OpsStatusBadge status={row.publishStatus} />
              </TableCell>

              {showInternal ? (
                <TableCell>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 px-3 text-xs"
                      onClick={() => setEditing(row)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </div>
                </TableCell>
              ) : null}
            </TableRow>
          );
        })}
      </OpsTable>

      {showInternal ? (
        <PricingEditDrawer
          open={editing !== null}
          product={editing}
          onClose={() => setEditing(null)}
          onSave={async (product, values) => {
            const ratio =
              product.sellingPrice > 0
                ? values.sellingPrice / product.sellingPrice
                : 1;
            await upsertProduct({
              ...product,
              sellingPrice: values.sellingPrice,
              internalCost: values.internalCost,
              deliveryCharge: values.deliveryCharge,
              bulkPrices: product.bulkPrices.map((tier) => ({
                ...tier,
                price: Math.round(tier.price * ratio),
              })),
              publishStatus: "PENDING_APPROVAL",
            });
            toast.success("Price saved — pending approval before going live");
          }}
        />
      ) : null}
    </OperationsShell>
  );
}
