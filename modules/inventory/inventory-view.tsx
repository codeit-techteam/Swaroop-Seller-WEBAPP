"use client";

import {
  Activity,
  AlertTriangle,
  Download,
  Eye,
  MoreHorizontal,
  Package,
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
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/lib/constants";
import { productCategories } from "@/lib/mock/products";
import { availableToSell, formatMt } from "@/lib/seller/format";
import {
  inventoryStatus,
  inventoryStatusLabel,
  warehouseForProduct,
} from "@/lib/seller/inventory";
import {
  cn,
  downloadFile,
  formatNumber,
  formatRelativeTime,
} from "@/lib/utils";
import { useLocationStore } from "@/store/locationStore";
import { useSellerProductStore } from "@/store/sellerProductStore";
import type { InventoryStockStatus } from "@/types/inventory";
import type { SellerProduct } from "@/types/seller";

import { AdjustStockDrawer } from "./adjust-stock-drawer";
import { InventoryDetailDrawer } from "./inventory-detail-drawer";
import { StockBarLegend, StockCompositionBar } from "./stock-bar";

type StatusFilter = "all" | InventoryStockStatus;
type LocationScope = "current" | "all";
type SortKey = "updated" | "sellable" | "onhand" | "grade";

function InventoryKpi({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Package;
  tone?: "default" | "info" | "warning" | "danger";
}) {
  const tones = {
    default: "bg-[#E8F1FF] text-[#1B6EF3]",
    info: "bg-[#E8F1FF] text-[#1B6EF3]",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-red-50 text-red-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            tones[tone],
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export function InventoryView() {
  const locationId = useLocationStore((s) => s.selectedLocationId);
  const locations = useLocationStore((s) => s.locations);
  const selectedLocation = useLocationStore((s) => s.getSelectedLocation());
  const products = useSellerProductStore((s) => s.products);
  const adjustments = useSellerProductStore((s) => s.adjustments);
  const adjustStock = useSellerProductStore((s) => s.adjustStock);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [scope, setScope] = useState<LocationScope>("current");
  const [sort, setSort] = useState<SortKey>("updated");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [adjustId, setAdjustId] = useState<string | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);

  const scoped = useMemo(() => {
    return products.filter((product) =>
      scope === "current" ? product.locationId === locationId : true,
    );
  }, [locationId, products, scope]);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return scoped
      .filter((product) => category === "all" || product.category === category)
      .filter((product) => {
        if (status === "all") return true;
        return inventoryStatus(product) === status;
      })
      .filter((product) => {
        if (!query) return true;
        const location = locations.find(
          (item) => item.id === product.locationId,
        );
        const warehouse = warehouseForProduct(product, location);
        return (
          product.gradeName.toLowerCase().includes(query) ||
          product.gradeCode.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.manufacturer.toLowerCase().includes(query) ||
          warehouse.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (sort === "sellable") {
          return (
            availableToSell(
              b.availableStock,
              b.reservedStock,
              b.committedStock,
            ) -
            availableToSell(a.availableStock, a.reservedStock, a.committedStock)
          );
        }
        if (sort === "onhand") return b.availableStock - a.availableStock;
        if (sort === "grade") return a.gradeName.localeCompare(b.gradeName);
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [category, locations, scoped, search, sort, status]);

  const summary = useMemo(() => {
    const onHand = scoped.reduce((sum, item) => sum + item.availableStock, 0);
    const reserved = scoped.reduce((sum, item) => sum + item.reservedStock, 0);
    const committed = scoped.reduce(
      (sum, item) => sum + item.committedStock,
      0,
    );
    const sellable = scoped.reduce(
      (sum, item) =>
        sum +
        availableToSell(
          item.availableStock,
          item.reservedStock,
          item.committedStock,
        ),
      0,
    );
    const low = scoped.filter((item) => inventoryStatus(item) === "LOW_STOCK");
    const out = scoped.filter(
      (item) => inventoryStatus(item) === "OUT_OF_STOCK",
    );
    return { onHand, reserved, committed, sellable, low, out };
  }, [scoped]);

  const warehouses = useMemo(() => {
    const groups = new Map<
      string,
      {
        name: string;
        city: string;
        onHand: number;
        grades: number;
        sellable: number;
      }
    >();
    for (const product of scoped) {
      const location = locations.find((item) => item.id === product.locationId);
      const name = warehouseForProduct(product, location);
      const current = groups.get(name) ?? {
        name,
        city: location?.city ?? "",
        onHand: 0,
        grades: 0,
        sellable: 0,
      };
      current.onHand += product.availableStock;
      current.grades += 1;
      current.sellable += availableToSell(
        product.availableStock,
        product.reservedStock,
        product.committedStock,
      );
      groups.set(name, current);
    }
    return Array.from(groups.values()).sort((a, b) => b.onHand - a.onHand);
  }, [locations, scoped]);

  const alerts = [...summary.out, ...summary.low];
  const primaryWarehouse = warehouses[0];
  const lastMovement = adjustments.find((item) =>
    scoped.some((product) => product.id === item.productId),
  );
  const lastMovedProduct = products.find(
    (item) => item.id === lastMovement?.productId,
  );
  const detail = products.find((item) => item.id === detailId) ?? null;
  const adjustProduct = products.find((item) => item.id === adjustId) ?? null;
  const detailLocation = locations.find(
    (item) => item.id === detail?.locationId,
  );

  const openAdjust = (product?: SellerProduct) => {
    setAdjustId(product?.id ?? null);
    setAdjustOpen(true);
  };

  const exportCsv = () => {
    const headers = [
      "Grade",
      "Code",
      "Category",
      "Warehouse",
      "Location",
      "On Hand (MT)",
      "Reserved (MT)",
      "Committed (MT)",
      "Sellable (MT)",
      "Status",
      "MOQ",
      "Updated",
    ];
    const csvRows = rows.map((product) => {
      const location = locations.find((item) => item.id === product.locationId);
      return [
        `"${product.gradeName}"`,
        product.gradeCode,
        `"${product.category}"`,
        `"${warehouseForProduct(product, location)}"`,
        `"${location?.name ?? ""}"`,
        product.availableStock,
        product.reservedStock,
        product.committedStock,
        availableToSell(
          product.availableStock,
          product.reservedStock,
          product.committedStock,
        ),
        inventoryStatusLabel(inventoryStatus(product)),
        product.moq,
        product.updatedAt,
      ].join(",");
    });
    downloadFile(
      [headers.join(","), ...csvRows].join("\n"),
      `inventory-${new Date().toISOString().slice(0, 10)}.csv`,
      "text/csv;charset=utf-8",
    );
    toast.success("Inventory report exported");
  };

  const statusTabs: { id: StatusFilter; label: string; count?: number }[] = [
    { id: "all", label: "All", count: scoped.length },
    {
      id: "IN_STOCK",
      label: "In Stock",
      count: scoped.filter((item) => inventoryStatus(item) === "IN_STOCK")
        .length,
    },
    { id: "LOW_STOCK", label: "Low", count: summary.low.length },
    {
      id: "OUT_OF_STOCK",
      label: "Out",
      count: summary.out.length,
    },
  ];

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Inventory"
        description={`${selectedLocation?.name ?? "Selected location"} · Track on-hand, reserved and sellable stock by warehouse.`}
        actions={
          <>
            <Button variant="outline" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={() => openAdjust()}>
              <Warehouse className="h-4 w-4" />
              Update Stock
            </Button>
            <Button asChild>
              <Link href={ROUTES.PRODUCTS_NEW}>
                <Plus className="h-4 w-4" />
                Add Grade
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <InventoryKpi
          label="On Hand"
          value={formatMt(summary.onHand)}
          hint={`${scoped.length} grades`}
          icon={Package}
        />
        <InventoryKpi
          label="Sellable"
          value={formatMt(summary.sellable)}
          hint="Available to offer"
          icon={Package}
          tone="info"
        />
        <InventoryKpi
          label="Reserved"
          value={formatMt(summary.reserved)}
          hint="Held for offers / PRs"
          icon={Warehouse}
        />
        <InventoryKpi
          label="Committed"
          value={formatMt(summary.committed)}
          hint="Against confirmed orders"
          icon={Warehouse}
        />
        <InventoryKpi
          label="Low Stock"
          value={String(summary.low.length)}
          hint={summary.low.length ? "Needs replenishment" : "Healthy"}
          icon={AlertTriangle}
          tone="warning"
        />
        <InventoryKpi
          label="Out of Stock"
          value={String(summary.out.length)}
          hint={summary.out.length ? "Cannot create offers" : "None"}
          icon={AlertTriangle}
          tone="danger"
        />
      </div>

      {alerts.length > 0 ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h2 className="text-sm font-semibold text-amber-900">
                {alerts.length} grade{alerts.length === 1 ? "" : "s"} need
                attention
              </h2>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-amber-200 bg-white"
              onClick={() =>
                setStatus(summary.out.length ? "OUT_OF_STOCK" : "LOW_STOCK")
              }
            >
              Review
            </Button>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {alerts.slice(0, 4).map((product) => {
              const itemStatus = inventoryStatus(product);
              return (
                <button
                  key={product.id}
                  type="button"
                  className="flex items-center justify-between rounded-lg border border-amber-100 bg-white px-3 py-2.5 text-left"
                  onClick={() => openAdjust(product)}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {product.gradeName}
                    </p>
                    <p className="text-xs text-slate-500">
                      Sellable{" "}
                      {formatMt(
                        availableToSell(
                          product.availableStock,
                          product.reservedStock,
                          product.committedStock,
                        ),
                      )}
                    </p>
                  </div>
                  <SellerStatusBadge status={itemStatus} />
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Warehouse
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {primaryWarehouse?.name ?? "No warehouse"}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {primaryWarehouse?.city ||
                  (warehouses.length > 1
                    ? `${warehouses.length} warehouses in view`
                    : "Assign stock to a location")}
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F1FF] text-[#1B6EF3]">
              <Warehouse className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-[11px] text-slate-400">On hand</p>
              <p className="font-semibold">
                {formatNumber(primaryWarehouse?.onHand ?? 0)} MT
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Sellable</p>
              <p className="font-semibold text-[#1B6EF3]">
                {formatNumber(primaryWarehouse?.sellable ?? 0)} MT
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Grades</p>
              <p className="font-semibold">{primaryWarehouse?.grades ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Stock health
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {summary.low.length + summary.out.length === 0
                  ? "Healthy"
                  : `${summary.low.length + summary.out.length} alerts`}
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-[11px] text-slate-400">In stock</p>
              <p className="font-semibold text-emerald-700">
                {
                  scoped.filter((item) => inventoryStatus(item) === "IN_STOCK")
                    .length
                }
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Low</p>
              <p className="font-semibold text-amber-700">
                {summary.low.length}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Out</p>
              <p className="font-semibold text-red-600">{summary.out.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Last movement
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {lastMovedProduct?.gradeName ?? "No movements yet"}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {lastMovement
                  ? `${lastMovement.reason} · ${formatRelativeTime(lastMovement.at)}`
                  : "Adjust stock to start the ledger"}
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Activity className="h-4 w-4" />
            </span>
          </div>
          {lastMovement ? (
            <p
              className={cn(
                "mt-4 text-sm font-semibold tabular-nums",
                lastMovement.delta >= 0 ? "text-emerald-700" : "text-amber-700",
              )}
            >
              {lastMovement.delta >= 0 ? "+" : ""}
              {formatMt(lastMovement.delta)}
            </p>
          ) : null}
        </div>
      </section>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatus(tab.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                status === tab.id
                  ? "bg-[#E8F1FF] text-[#1B6EF3]"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              {tab.label}
              <span className="ml-1.5 text-xs tabular-nums text-slate-400">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search grade, SKU, warehouse"
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full lg:w-52">
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
        <Select
          value={scope}
          onValueChange={(value) => setScope(value as LocationScope)}
        >
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">This location</SelectItem>
            <SelectItem value="all">All warehouses</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sort}
          onValueChange={(value) => setSort(value as SortKey)}
        >
          <SelectTrigger className="w-full lg:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Last updated</SelectItem>
            <SelectItem value="sellable">Sellable</SelectItem>
            <SelectItem value="onhand">On hand</SelectItem>
            <SelectItem value="grade">Grade</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No inventory at this location"
          description="Add a grade or switch warehouses to start tracking stock."
          action={
            <Button asChild>
              <Link href={ROUTES.PRODUCTS_NEW}>Add Grade</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">
              {formatNumber(rows.length)} grade{rows.length === 1 ? "" : "s"}
            </p>
            <StockBarLegend />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Grade</th>
                  <th className="px-4 py-3 font-medium">Warehouse</th>
                  <th className="px-4 py-3 font-medium">Composition</th>
                  <th className="px-4 py-3 font-medium">On Hand</th>
                  <th className="px-4 py-3 font-medium">Sellable</th>
                  <th className="px-4 py-3 font-medium">Reserved</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((product) => {
                  const location = locations.find(
                    (item) => item.id === product.locationId,
                  );
                  const itemStatus = inventoryStatus(product);
                  const sellable = availableToSell(
                    product.availableStock,
                    product.reservedStock,
                    product.committedStock,
                  );
                  return (
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
                          {product.gradeCode} · {product.category}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-800">
                          {warehouseForProduct(product, location)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {location?.name ?? "—"}
                        </p>
                      </td>
                      <td className="min-w-[160px] px-4 py-3">
                        <StockCompositionBar product={product} />
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatMt(product.availableStock)}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 font-medium tabular-nums",
                          itemStatus === "OUT_OF_STOCK"
                            ? "text-red-600"
                            : itemStatus === "LOW_STOCK"
                              ? "text-amber-700"
                              : "text-[#1B6EF3]",
                        )}
                      >
                        {formatMt(sellable)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-600">
                        {formatMt(product.reservedStock)}
                      </td>
                      <td className="px-4 py-3">
                        <SellerStatusBadge status={itemStatus} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatRelativeTime(product.updatedAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            className="h-8 px-3 text-xs"
                            onClick={() => openAdjust(product)}
                          >
                            Update
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                aria-label="More inventory actions"
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
                                <Link
                                  href={`${ROUTES.OFFERS_NEW}?productId=${product.id}`}
                                >
                                  Create Offer
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`${ROUTES.PRODUCTS}/${product.id}`}>
                                  View Grade
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InventoryDetailDrawer
        product={detail}
        location={detailLocation}
        movements={adjustments.filter((item) => item.productId === detailId)}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
        onAdjust={() => {
          if (!detail) return;
          setDetailId(null);
          openAdjust(detail);
        }}
      />

      <AdjustStockDrawer
        key={`${adjustOpen}-${adjustId ?? "blank"}`}
        open={adjustOpen}
        product={adjustProduct}
        products={scoped}
        onOpenChange={(open) => {
          setAdjustOpen(open);
          if (!open) setAdjustId(null);
        }}
        onSave={(productId, delta, reason) => {
          adjustStock(productId, delta, reason);
        }}
      />
    </PageContainer>
  );
}
