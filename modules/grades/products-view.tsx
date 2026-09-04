"use client";

import {
  Eye,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Search,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { EmptyState } from "@/components/common/empty-state";
import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { DetailDrawer } from "@/components/drawers/detail-drawer";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/lib/constants";
import { productCategories } from "@/lib/mock/products";
import {
  availableToSell,
  formatMt,
  formatPricePerKg,
} from "@/lib/seller/format";
import { formatDateTime } from "@/lib/utils";
import { useLocationStore } from "@/store/locationStore";
import { useSellerOfferStore } from "@/store/sellerOfferStore";
import { useSellerProductStore } from "@/store/sellerProductStore";

export function SellerProductsView() {
  const locationId = useLocationStore((s) => s.selectedLocationId);
  const locations = useLocationStore((s) => s.locations);
  const products = useSellerProductStore((s) => s.products);
  const offers = useSellerOfferStore((s) => s.offers);
  const search = useSellerProductStore((s) => s.search);
  const setSearch = useSellerProductStore((s) => s.setSearch);
  const category = useSellerProductStore((s) => s.category);
  const setCategory = useSellerProductStore((s) => s.setCategory);
  const stockDrawerOpen = useSellerProductStore((s) => s.stockDrawerOpen);
  const selectedProductId = useSellerProductStore((s) => s.selectedProductId);
  const openStockDrawer = useSellerProductStore((s) => s.openStockDrawer);
  const closeStockDrawer = useSellerProductStore((s) => s.closeStockDrawer);
  const adjustStock = useSellerProductStore((s) => s.adjustStock);
  const [delta, setDelta] = useState("0");
  const [reason, setReason] = useState("Physical count");
  const [sort, setSort] = useState("updated");
  const [detailId, setDetailId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products
      .filter((product) => product.locationId === locationId)
      .filter((product) => category === "all" || product.category === category)
      .filter(
        (product) =>
          !query ||
          product.gradeName.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.manufacturer.toLowerCase().includes(query),
      )
      .sort((a, b) =>
        sort === "stock"
          ? b.availableStock - a.availableStock
          : b.updatedAt.localeCompare(a.updatedAt),
      );
  }, [category, locationId, products, search, sort]);

  const selected = products.find((item) => item.id === selectedProductId);
  const detail = products.find((item) => item.id === detailId);

  const priceFor = (productId: string) =>
    offers.find(
      (offer) =>
        offer.productId === productId &&
        offer.locationId === locationId &&
        offer.status === "active",
    )?.price;

  return (
    <PageContainer>
      <PageHeader
        title="My Products / Grades"
        description="Industrial grades represented by specifications and stock — no product images."
        actions={
          <Button asChild>
            <Link href={ROUTES.PRODUCTS_NEW}>
              <Plus className="mr-1 h-4 w-4" /> Add Grade
            </Link>
          </Button>
        }
      />
      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search grade, category, manufacturer"
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-56">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {productCategories.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Last updated</SelectItem>
            <SelectItem value="stock">Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No grades at this location"
          description="Add a grade to start creating offers."
          action={
            <Button asChild>
              <Link href={ROUTES.PRODUCTS_NEW}>Add Grade</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Grade</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Manufacturer</th>
                <th className="px-4 py-3 font-medium">Available Stock</th>
                <th className="px-4 py-3 font-medium">Unit</th>
                <th className="px-4 py-3 font-medium">Active Offer</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((product) => (
                <tr
                  key={product.id}
                  className="border-t border-slate-100 hover:bg-slate-50/80"
                >
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-left font-medium text-slate-900 hover:text-[#1B6EF3]"
                      onClick={() => setDetailId(product.id)}
                    >
                      {product.gradeName}
                    </button>
                    <p className="text-xs text-slate-500">
                      {product.gradeCode}
                    </p>
                  </td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3">{product.manufacturer}</td>
                  <td className="px-4 py-3">
                    {formatMt(product.availableStock)}
                  </td>
                  <td className="px-4 py-3">{product.unit}</td>
                  <td className="px-4 py-3">
                    <SellerStatusBadge status={product.offerStatus} />
                  </td>
                  <td className="px-4 py-3">
                    {priceFor(product.id)
                      ? formatPricePerKg(priceFor(product.id) ?? 0)
                      : product.basePrice
                        ? formatPricePerKg(product.basePrice)
                        : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {locations.find((item) => item.id === product.locationId)
                      ?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <SellerStatusBadge
                      status={
                        product.offerStatus === "active" ? "active" : "inactive"
                      }
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <Button size="sm" className="h-8 px-3 text-xs" asChild>
                        <Link
                          href={`${ROUTES.OFFERS_NEW}?productId=${product.id}`}
                        >
                          Create Offer
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            aria-label="More product actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={() => setDetailId(product.id)}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`${ROUTES.PRODUCTS}/${product.id}`}>
                              <Pencil className="h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openStockDrawer(product.id)}
                          >
                            <Warehouse className="h-4 w-4" />
                            Manage Stock
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DetailDrawer
        open={stockDrawerOpen}
        onOpenChange={(open) => {
          if (!open) closeStockDrawer();
        }}
        title="Stock adjustment"
        footer={
          <Button
            className="w-full"
            onClick={() => {
              if (!selected) return;
              adjustStock(selected.id, Number(delta) || 0, reason);
              toast.success("Stock updated");
              closeStockDrawer();
            }}
          >
            Save adjustment
          </Button>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <p className="font-medium">{selected.gradeName}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>Available: {formatMt(selected.availableStock)}</div>
              <div>Reserved: {formatMt(selected.reservedStock)}</div>
              <div>Committed: {formatMt(selected.committedStock)}</div>
              <div>
                Available to sell:{" "}
                {formatMt(
                  availableToSell(
                    selected.availableStock,
                    selected.reservedStock,
                    selected.committedStock,
                  ),
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="delta">Adjustment (MT)</Label>
              <Input
                id="delta"
                className="mt-1"
                value={delta}
                onChange={(event) => setDelta(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                className="mt-1"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </div>
          </div>
        ) : null}
      </DetailDrawer>
      <DetailDrawer
        open={Boolean(detail)}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
        title={detail?.gradeName ?? "Grade"}
      >
        {detail ? (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase text-slate-500">Category</dt>
              <dd className="font-medium">{detail.category}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-500">Manufacturer</dt>
              <dd className="font-medium">{detail.manufacturer}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-500">MFI</dt>
              <dd className="font-medium">{detail.mfi}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-500">Application</dt>
              <dd className="font-medium">{detail.application}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-500">Stock</dt>
              <dd className="font-medium">{formatMt(detail.availableStock)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-500">Updated</dt>
              <dd className="font-medium">
                {formatDateTime(detail.updatedAt)}
              </dd>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" asChild>
                <Link href={`${ROUTES.PRODUCTS}/${detail.id}`}>Edit</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={`${ROUTES.OFFERS_NEW}?productId=${detail.id}`}>
                  Create Offer
                </Link>
              </Button>
            </div>
          </dl>
        ) : null}
      </DetailDrawer>
    </PageContainer>
  );
}
