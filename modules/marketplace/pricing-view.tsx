"use client";

import { useMemo } from "react";
import toast from "react-hot-toast";

import {
  OperationsShell,
  OpsStatusBadge,
  OpsTable,
} from "@/components/operations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { CURRENT_USER } from "@/config";
import { isSellerRole } from "@/config/roles";
import { useClientTable } from "@/hooks/useClientTable";
import { marginOf } from "@/lib/cx";
import { formatCompactInr, formatPercentage } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useMarketplaceCmsStore } from "@/store/marketplaceCmsStore";
import type { CatalogProduct } from "@/types/marketplace-cms";

export function PricingView() {
  const products = useMarketplaceCmsStore((s) => s.products);
  const upsertProduct = useMarketplaceCmsStore((s) => s.upsertProduct);
  const role = useAuthStore((s) => s.user?.role ?? CURRENT_USER.role);
  const showInternal = !isSellerRole(role);
  const searchFields = useMemo(
    () => (row: CatalogProduct) => [row.name, row.grade, row.location],
    [],
  );
  const table = useClientTable({
    rows: products,
    searchFields,
    getStatus: (row) => row.publishStatus,
  });

  return (
    <OperationsShell
      title="Customer pricing"
      subtitle="Customers see selling price only. Internal cost and margin stay on this desk."
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search product pricing"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={["ALL", "LIVE", "DRAFT", "PAUSED"]}
        headers={
          showInternal
            ? [
                "Product",
                "Selling",
                "Market",
                "Cost",
                "Margin",
                "Margin %",
                "MOQ",
                "Delivery",
                "Effective",
                "Status",
                "Save",
              ]
            : [
                "Product",
                "Selling",
                "Market",
                "MOQ",
                "Delivery",
                "Effective",
                "Status",
              ]
        }
        emptyTitle="No prices"
        emptyDescription="Publish a product to manage customer-facing price."
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.filtered.length}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        rowCount={table.paginated.length}
      >
        {table.paginated.map((row) => (
          <PricingRow
            key={row.id}
            product={row}
            showInternal={showInternal}
            onSave={async (sellingPrice, internalCost) => {
              await upsertProduct({
                ...row,
                sellingPrice,
                internalCost,
                publishStatus: "PENDING_APPROVAL",
              });
              toast.success("Price saved as pending approval");
            }}
          />
        ))}
      </OpsTable>
    </OperationsShell>
  );
}

function PricingRow({
  product,
  showInternal,
  onSave,
}: {
  product: CatalogProduct;
  showInternal: boolean;
  onSave: (sellingPrice: number, internalCost: number) => Promise<void>;
}) {
  const { margin, pct } = marginOf(product);
  return (
    <TableRow>
      <TableCell>
        <p className="font-medium">{product.name}</p>
        <p className="text-xs text-slate-400">{product.location}</p>
      </TableCell>
      <TableCell className="tabular-nums">
        {formatCompactInr(product.sellingPrice)}
      </TableCell>
      <TableCell className="tabular-nums">
        {formatCompactInr(product.marketPrice)}
      </TableCell>
      {showInternal ? (
        <>
          <TableCell className="tabular-nums">
            {formatCompactInr(product.internalCost)}
          </TableCell>
          <TableCell className="tabular-nums">
            {formatCompactInr(margin)}
          </TableCell>
          <TableCell>{formatPercentage(pct)}</TableCell>
        </>
      ) : null}
      <TableCell>
        {product.moq} {product.unit}
      </TableCell>
      <TableCell>{formatCompactInr(product.deliveryCharge)}</TableCell>
      <TableCell>{product.effectiveDate}</TableCell>
      <TableCell>
        <OpsStatusBadge status={product.publishStatus} />
      </TableCell>
      {showInternal ? (
        <TableCell>
          <form
            className="flex items-center gap-1"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const selling = Number(data.get("selling"));
              const cost = Number(data.get("cost"));
              if (!selling) {
                toast.error("Selling price is required");
                return;
              }
              void onSave(selling, cost);
            }}
          >
            <Input
              name="selling"
              type="number"
              defaultValue={product.sellingPrice}
              className="h-8 w-24"
            />
            <Input
              name="cost"
              type="number"
              defaultValue={product.internalCost}
              className="h-8 w-24"
            />
            <Button size="sm" className="h-8 bg-[#0B1F3A] hover:bg-[#122846]">
              Save
            </Button>
          </form>
        </TableCell>
      ) : null}
    </TableRow>
  );
}
