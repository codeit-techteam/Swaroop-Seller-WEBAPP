"use client";

import { Eye, FileEdit, Globe, Package, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmActionDialog } from "@/components/cx";
import {
  OperationsShell,
  OpsStatusBadge,
  OpsTable,
} from "@/components/operations";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { useClientTable } from "@/hooks/useClientTable";
import { cn, formatCompactInr } from "@/lib/utils";
import { ProductFormDrawer } from "@/modules/marketplace/product-form-drawer";
import { useMarketplaceCmsStore } from "@/store/marketplaceCmsStore";
import type { CatalogProduct } from "@/types/marketplace-cms";

function stockTone(qty: number) {
  if (qty <= 0) return "text-red-600";
  if (qty < 50) return "text-amber-600";
  return "text-slate-700";
}

function stockLabel(qty: number, unit: string) {
  if (qty <= 0) return "Out of stock";
  if (qty < 50) return `${qty} ${unit} · Low`;
  return `${qty} ${unit}`;
}

export function CatalogView() {
  const products = useMarketplaceCmsStore((s) => s.products);
  const categories = useMarketplaceCmsStore((s) => s.categories);
  const upsertProduct = useMarketplaceCmsStore((s) => s.upsertProduct);
  const setProductStatus = useMarketplaceCmsStore((s) => s.setProductStatus);
  const [open, setOpen] = useState<CatalogProduct | "new" | null>(null);
  const [pending, setPending] = useState<{ id: string; live: boolean } | null>(
    null,
  );
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const visibleProducts = useMemo(
    () =>
      categoryFilter === "ALL"
        ? products
        : products.filter((row) => row.categoryId === categoryFilter),
    [categoryFilter, products],
  );

  const searchFields = useMemo(
    () => (row: CatalogProduct) => [
      row.name,
      row.grade,
      row.brand,
      row.sku,
      row.material,
    ],
    [],
  );
  const table = useClientTable({
    rows: visibleProducts,
    searchFields,
    getStatus: (row) => row.publishStatus,
  });

  const liveCount = products.filter(
    (row) => row.publishStatus === "LIVE",
  ).length;
  const draftCount = products.filter(
    (row) => row.publishStatus === "DRAFT",
  ).length;
  const previewCount = products.filter(
    (row) => row.publishStatus === "PREVIEW",
  ).length;

  return (
    <OperationsShell
      title="Customer catalog"
      subtitle="Published products appear on Customer APP and Customer WEB. Drafts stay internal until you go live."
      kpis={[
        {
          title: "SKUs",
          value: products.length,
          icon: Package,
          hint: "Total products in catalog",
        },
        {
          title: "Live",
          value: liveCount,
          icon: Globe,
          accent: "emerald",
          hint: "Visible to customers",
        },
        {
          title: "Draft",
          value: draftCount,
          icon: FileEdit,
          accent: "amber",
          hint: "Not yet published",
        },
        {
          title: "Preview",
          value: previewCount,
          icon: Eye,
          accent: "blue",
          hint: "Internal preview only",
        },
      ]}
      actions={
        <Button
          className="bg-[#0B1F3A] hover:bg-[#122846]"
          onClick={() => setOpen("new")}
        >
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      }
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search grade, brand or SKU"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={[
          "ALL",
          "DRAFT",
          "PREVIEW",
          "PENDING_APPROVAL",
          "LIVE",
          "PAUSED",
          "ARCHIVED",
        ]}
        extraFilters={
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-10 w-[160px] border-slate-200 bg-white text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        headers={[
          "Product",
          "Category",
          "Brand",
          "Price",
          "Stock",
          "MOQ",
          "Status",
          "Actions",
        ]}
        emptyTitle="No products"
        emptyDescription="Add a product and publish it to the customer marketplace."
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.filtered.length}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        rowCount={table.paginated.length}
      >
        {table.paginated.map((row) => {
          const categoryName =
            categories.find((item) => item.id === row.categoryId)?.name ??
            row.categoryId;
          const isLive = row.publishStatus === "LIVE";

          return (
            <TableRow key={row.id} className="align-middle">
              <TableCell>
                <div className="flex min-w-[220px] items-center gap-3">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    {row.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.images[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <Package className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">
                      {row.name}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {row.grade} · {row.sku}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {categoryName}
                </span>
              </TableCell>
              <TableCell className="text-slate-700">{row.brand}</TableCell>
              <TableCell>
                <p className="font-medium text-slate-800">
                  {formatCompactInr(row.sellingPrice)}
                </p>
                <p className="text-xs text-slate-400">
                  per {row.unit}
                  {row.bulkPrices?.length
                    ? ` · ${row.bulkPrices.length} tiers`
                    : ""}
                </p>
              </TableCell>
              <TableCell>
                <p
                  className={cn(
                    "text-sm font-medium",
                    stockTone(row.availableQty),
                  )}
                >
                  {stockLabel(row.availableQty, row.unit)}
                </p>
              </TableCell>
              <TableCell className="text-slate-700">
                {row.moq} {row.unit}
              </TableCell>
              <TableCell>
                <OpsStatusBadge status={row.publishStatus} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 shrink-0 px-3 text-xs"
                    onClick={() => setOpen(row)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant={isLive ? "outline" : "default"}
                    className={cn(
                      "h-8 shrink-0 px-3 text-xs",
                      isLive
                        ? "text-slate-600"
                        : "bg-[#0B1F3A] text-white hover:bg-[#122846]",
                    )}
                    onClick={() => setPending({ id: row.id, live: !isLive })}
                  >
                    {isLive ? "Unpublish" : "Publish"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </OpsTable>
      <ProductFormDrawer
        open={open !== null}
        product={open && open !== "new" ? open : undefined}
        categories={categories}
        onClose={() => setOpen(null)}
        onSave={async (input) => {
          await upsertProduct(input);
          toast.success(
            input.publishStatus === "LIVE"
              ? "Product saved and visible to customers"
              : input.publishStatus === "PREVIEW"
                ? "Product saved as internal preview"
                : "Product saved as draft",
          );
        }}
      />
      <ConfirmActionDialog
        open={Boolean(pending)}
        title={
          pending?.live
            ? "Publish product to Customer APP/WEB?"
            : "Unpublish this product?"
        }
        description="Only LIVE products are returned by the published marketplace API."
        confirmLabel={pending?.live ? "Publish" : "Unpublish"}
        destructive={!pending?.live}
        onCancel={() => setPending(null)}
        onConfirm={async () => {
          if (!pending) return;
          await setProductStatus(
            pending.id,
            pending.live ? "LIVE" : "PAUSED",
            pending.live,
          );
          toast.success(
            pending.live
              ? "Product is live on Customer APP/WEB"
              : "Product unpublished",
          );
          setPending(null);
        }}
      />
    </OperationsShell>
  );
}
