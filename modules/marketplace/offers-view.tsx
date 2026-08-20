"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { CxFormDrawer, FieldError } from "@/components/cx";
import {
  OperationsShell,
  OpsStatusBadge,
  OpsTable,
} from "@/components/operations";
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
import { TableCell, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useClientTable } from "@/hooks/useClientTable";
import { useCustomerStore } from "@/store/customerStore";
import { useMarketplaceCmsStore } from "@/store/marketplaceCmsStore";
import type {
  DiscountType,
  MarketplaceOffer,
  OfferLifecycle,
} from "@/types/marketplace-cms";

export function MarketplaceOffersView() {
  const offers = useMarketplaceCmsStore((s) => s.offers);
  const products = useMarketplaceCmsStore((s) => s.products);
  const categories = useMarketplaceCmsStore((s) => s.categories);
  const segments = useCustomerStore((s) => s.segments);
  const upsertOffer = useMarketplaceCmsStore((s) => s.upsertOffer);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [discountValue, setDiscountValue] = useState("3");
  const [minQty, setMinQty] = useState("50");
  const [status, setStatus] = useState<OfferLifecycle>("DRAFT");
  const [terms, setTerms] = useState("");
  const searchFields = useMemo(
    () => (row: MarketplaceOffer) => [
      row.name,
      row.promoCode ?? "",
      row.status,
    ],
    [],
  );
  const table = useClientTable({
    rows: offers,
    searchFields,
    getStatus: (row) => row.status,
  });

  return (
    <OperationsShell
      title="Offers & promotions"
      subtitle="Published offers appear on Customer APP/WEB. High-risk changes stay in Draft until you activate them."
      actions={
        <Button
          className="bg-[#0B1F3A] hover:bg-[#122846]"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create offer
        </Button>
      }
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search offers"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={[
          "ALL",
          "DRAFT",
          "SCHEDULED",
          "ACTIVE",
          "EXPIRED",
          "PAUSED",
        ]}
        headers={[
          "Offer",
          "Product",
          "Discount",
          "Qty",
          "Window",
          "Segment",
          "Status",
        ]}
        emptyTitle="No offers"
        emptyDescription="Create a promotion to publish on the customer homepage."
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.filtered.length}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        rowCount={table.paginated.length}
      >
        {table.paginated.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <p className="font-medium">{row.name}</p>
              <p className="text-xs text-slate-400">
                {row.promoCode || "No code"}
              </p>
            </TableCell>
            <TableCell>
              {products.find((item) => item.id === row.productId)?.name ??
                "Category offer"}
            </TableCell>
            <TableCell>
              {row.discountValue}
              {row.discountType === "PERCENT" ? "%" : " ₹"}
            </TableCell>
            <TableCell>
              {row.minQty}
              {row.maxQty ? `–${row.maxQty}` : "+"} MT
            </TableCell>
            <TableCell>
              {row.startDate} → {row.endDate}
            </TableCell>
            <TableCell>
              {segments.find((item) => item.id === row.segmentId)?.name ??
                "All"}
            </TableCell>
            <TableCell>
              <OpsStatusBadge status={row.status} />
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>

      <CxFormDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="Create offer"
        submitLabel="Save offer"
        onSubmit={async () => {
          if (name.trim().length < 3) {
            toast.error("Offer name is required");
            return;
          }
          await upsertOffer({
            name: name.trim(),
            productId,
            categoryId: products.find((item) => item.id === productId)
              ?.categoryId,
            discountType: "PERCENT" as DiscountType,
            discountValue: Number(discountValue) || 0,
            minQty: Number(minQty) || 1,
            startDate: new Date().toISOString().slice(0, 10),
            endDate: "2026-12-31",
            terms: terms || "Standard PetroTrade promotion terms.",
            bannerImage:
              products.find((item) => item.id === productId)?.images[0] ?? "",
            status,
          });
          toast.success(
            status === "ACTIVE"
              ? "Offer is live on Customer APP/WEB"
              : "Offer saved",
          );
          setOpen(false);
          setName("");
        }}
      >
        <div className="space-y-1">
          <Label>Offer name</Label>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <FieldError message={name.trim() ? undefined : "Required"} />
        </div>
        <div className="space-y-1">
          <Label>Product</Label>
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Discount %</Label>
            <Input
              type="number"
              value={discountValue}
              onChange={(event) => setDiscountValue(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Minimum qty (MT)</Label>
            <Input
              type="number"
              value={minQty}
              onChange={(event) => setMinQty(event.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as OfferLifecycle)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["DRAFT", "SCHEDULED", "ACTIVE", "PAUSED"].map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Terms & conditions</Label>
          <Textarea
            value={terms}
            onChange={(event) => setTerms(event.target.value)}
          />
        </div>
        <p className="text-xs text-slate-400">
          {categories.length} categories available for targeting.
        </p>
      </CxFormDrawer>
    </OperationsShell>
  );
}
