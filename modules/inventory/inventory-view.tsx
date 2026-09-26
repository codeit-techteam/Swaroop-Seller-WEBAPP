"use client";

import {
  Activity,
  AlertTriangle,
  Boxes,
  Download,
  Eye,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCw,
  Search,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { EmptyState } from "@/components/common/empty-state";
import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { InventoryPageSkeleton } from "@/components/skeleton";
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
import { formatMt } from "@/lib/seller/format";
import {
  inventoryItemStatus,
  inventoryStatusLabel,
  toSellerProductCompat,
} from "@/lib/seller/inventory";
import {
  cn,
  downloadFile,
  formatNumber,
  formatRelativeTime,
} from "@/lib/utils";
import { useInventoryDashboardStore } from "@/store/inventoryDashboardStore";
import type {
  InventoryListItem,
  InventoryStockStatus,
} from "@/types/inventory";

import { AdjustStockDrawer } from "./adjust-stock-drawer";
import { InventoryDetailDrawer } from "./inventory-detail-drawer";
import { StockBarLegend, StockCompositionBar } from "./stock-bar";

type StatusFilter = "all" | InventoryStockStatus;
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

function movementLabel(type: string): string {
  const normalized = type.replace(/_/g, " ").toLowerCase();
  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function InventoryView() {
  const summary = useInventoryDashboardStore((s) => s.summary);
  const items = useInventoryDashboardStore((s) => s.items);
  const alerts = useInventoryDashboardStore((s) => s.alerts);
  const warehouses = useInventoryDashboardStore((s) => s.warehouses);
  const latestMovement = useInventoryDashboardStore((s) => s.latestMovement);
  const total = useInventoryDashboardStore((s) => s.total);
  const loading = useInventoryDashboardStore((s) => s.loading);
  const loadError = useInventoryDashboardStore((s) => s.loadError);
  const fetchDashboard = useInventoryDashboardStore((s) => s.fetchDashboard);
  const adjustStock = useInventoryDashboardStore((s) => s.adjustStock);
  const setSearch = useInventoryDashboardStore((s) => s.setSearch);
  const setStockStatus = useInventoryDashboardStore((s) => s.setStockStatus);
  const setWarehouseId = useInventoryDashboardStore((s) => s.setWarehouseId);
  const storeSearch = useInventoryDashboardStore((s) => s.search);
  const storeStatus = useInventoryDashboardStore((s) => s.stockStatus);
  const storeWarehouseId = useInventoryDashboardStore((s) => s.warehouseId);

  const [searchInput, setSearchInput] = useState(storeSearch);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortKey>("updated");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [adjustId, setAdjustId] = useState<string | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (searchInput === storeSearch) return;
      setSearch(searchInput);
      void fetchDashboard();
    }, 350);
    return () => window.clearTimeout(handle);
  }, [fetchDashboard, searchInput, setSearch, storeSearch]);

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(items.map((item) => item.category).filter(Boolean)),
      ).sort(),
    [items],
  );

  const rows = useMemo(() => {
    return items
      .filter((item) => category === "all" || item.category === category)
      .sort((a, b) => {
        if (sort === "sellable") return b.sellableQuantity - a.sellableQuantity;
        if (sort === "onhand") return b.onHandQuantity - a.onHandQuantity;
        if (sort === "grade") return a.gradeName.localeCompare(b.gradeName);
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [category, items, sort]);

  const inStockCount = useMemo(() => {
    if (!summary) return 0;
    return Math.max(
      summary.skuCount - summary.lowStock - summary.outOfStock,
      0,
    );
  }, [summary]);

  const primaryWarehouse = warehouses[0];
  const detail = items.find((item) => item.id === detailId) ?? null;
  const adjustItem = items.find((item) => item.id === adjustId) ?? null;
  const adjustProducts = items.map(toSellerProductCompat);

  const openAdjust = (item?: InventoryListItem) => {
    setAdjustId(item?.id ?? null);
    setAdjustOpen(true);
  };

  const applyStatusFilter = (next: StatusFilter) => {
    setStockStatus(next);
    void fetchDashboard();
  };

  const applyWarehouseFilter = (next: string) => {
    setWarehouseId(next);
    void fetchDashboard();
  };

  const exportCsv = () => {
    const headers = [
      "Grade",
      "Code",
      "Category",
      "Warehouse",
      "City",
      "On Hand (MT)",
      "Sellable (MT)",
      "Status",
      "MOQ",
      "Updated",
    ];
    const csvRows = rows.map((item) =>
      [
        `"${item.gradeName}"`,
        item.gradeCode,
        `"${item.category}"`,
        `"${item.warehouseName}"`,
        `"${item.warehouseCity}"`,
        item.onHandQuantity,
        item.sellableQuantity,
        inventoryStatusLabel(inventoryItemStatus(item)),
        item.moq,
        item.updatedAt,
      ].join(","),
    );
    downloadFile(
      [headers.join(","), ...csvRows].join("\n"),
      `inventory-${new Date().toISOString().slice(0, 10)}.csv`,
      "text/csv;charset=utf-8",
    );
    toast.success("Inventory report exported");
  };

  const statusTabs: { id: StatusFilter; label: string; count?: number }[] = [
    { id: "all", label: "All", count: summary?.skuCount },
    {
      id: "IN_STOCK",
      label: "In Stock",
      count: Math.max(
        (summary?.skuCount ?? 0) -
          (summary?.lowStock ?? 0) -
          (summary?.outOfStock ?? 0),
        0,
      ),
    },
    { id: "LOW_STOCK", label: "Low", count: summary?.lowStock },
    { id: "OUT_OF_STOCK", label: "Out", count: summary?.outOfStock },
  ];

  if (loading && !summary) {
    return <InventoryPageSkeleton />;
  }

  if (loadError && !summary) {
    return (
      <PageContainer>
        <PageHeader title="Inventory" />
        <EmptyState
          title="Unable to load inventory"
          description={loadError}
          action={<Button onClick={() => void fetchDashboard()}>Retry</Button>}
        />
      </PageContainer>
    );
  }

  const unit = summary?.unit ?? "MT";
  const formatQty = (value: number) =>
    unit === "MT" ? formatMt(value) : `${formatNumber(value)} ${unit}`;

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Track on-hand and sellable stock by warehouse from live backend data."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => void fetchDashboard()}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={exportCsv}
              disabled={!rows.length}
            >
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
          value={formatQty(summary?.onHand ?? 0)}
          hint={`${summary?.skuCount ?? 0} inventory rows`}
          icon={Package}
        />
        <InventoryKpi
          label="Sellable"
          value={formatQty(summary?.sellable ?? 0)}
          hint="Available to offer"
          icon={Package}
          tone="info"
        />
        <InventoryKpi
          label="Active Products"
          value={String(summary?.activeProducts ?? 0)}
          hint="Currently listed"
          icon={Boxes}
        />
        <InventoryKpi
          label="Warehouses"
          value={String(summary?.warehouses ?? 0)}
          hint="Active locations"
          icon={Warehouse}
        />
        <InventoryKpi
          label="Low Stock"
          value={String(summary?.lowStock ?? 0)}
          hint={summary?.lowStock ? "Needs replenishment" : "Healthy"}
          icon={AlertTriangle}
          tone="warning"
        />
        <InventoryKpi
          label="Out of Stock"
          value={String(summary?.outOfStock ?? 0)}
          hint={summary?.outOfStock ? "Cannot create offers" : "None"}
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
              onClick={() => applyStatusFilter("LOW_STOCK")}
            >
              Review
            </Button>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {alerts.slice(0, 4).map((item) => {
              const itemStatus = inventoryItemStatus(item);
              return (
                <button
                  key={item.id}
                  type="button"
                  className="flex items-center justify-between rounded-lg border border-amber-100 bg-white px-3 py-2.5 text-left"
                  onClick={() => openAdjust(item)}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {item.gradeName}
                    </p>
                    <p className="text-xs text-slate-500">
                      Sellable {formatQty(item.sellableQuantity)}
                    </p>
                  </div>
                  <SellerStatusBadge status={itemStatus} />
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-emerald-700" />
            <div>
              <h2 className="text-sm font-semibold text-emerald-900">
                Stock looks healthy
              </h2>
              <p className="text-xs text-emerald-800/80">
                No products currently require replenishment.
              </p>
            </div>
          </div>
        </section>
      )}

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
                    : "Assign stock to a warehouse")}
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
                {formatNumber(primaryWarehouse?.onHand ?? 0)} {unit}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Sellable</p>
              <p className="font-semibold text-[#1B6EF3]">
                {formatNumber(primaryWarehouse?.sellable ?? 0)} {unit}
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
                {(summary?.lowStock ?? 0) + (summary?.outOfStock ?? 0) === 0
                  ? "Healthy"
                  : `${(summary?.lowStock ?? 0) + (summary?.outOfStock ?? 0)} alerts`}
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-[11px] text-slate-400">In stock</p>
              <p className="font-semibold text-emerald-700">{inStockCount}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Low</p>
              <p className="font-semibold text-amber-700">
                {summary?.lowStock ?? 0}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Out</p>
              <p className="font-semibold text-red-600">
                {summary?.outOfStock ?? 0}
              </p>
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
                {latestMovement?.productName ?? "No inventory movements yet."}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {latestMovement
                  ? `${movementLabel(latestMovement.type)}${
                      latestMovement.warehouseName
                        ? ` · ${latestMovement.warehouseName}`
                        : ""
                    } · ${formatRelativeTime(latestMovement.timestamp)}`
                  : "Adjust stock to start the ledger"}
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Activity className="h-4 w-4" />
            </span>
          </div>
          {latestMovement ? (
            <p
              className={cn(
                "mt-4 text-sm font-semibold tabular-nums",
                latestMovement.quantityDelta >= 0
                  ? "text-emerald-700"
                  : "text-amber-700",
              )}
            >
              {latestMovement.quantityDelta >= 0 ? "+" : ""}
              {formatNumber(latestMovement.quantityDelta)} {latestMovement.unit}
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
              onClick={() => applyStatusFilter(tab.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                storeStatus === tab.id
                  ? "bg-[#E8F1FF] text-[#1B6EF3]"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              {tab.label}
              <span className="ml-1.5 text-xs tabular-nums text-slate-400">
                {tab.count ?? 0}
              </span>
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
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
            {categoryOptions.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={storeWarehouseId} onValueChange={applyWarehouseFilter}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Warehouse" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All warehouses</SelectItem>
            {warehouses.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </SelectItem>
            ))}
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
          title="No inventory found"
          description="Add a grade to create inventory, or clear filters to see all stock."
          action={
            <Button asChild>
              <Link href={ROUTES.PRODUCTS_NEW}>Add Grade</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">
                Showing {formatNumber(rows.length)} of {formatNumber(total)}{" "}
                grade{total === 1 ? "" : "s"}
              </p>
              <StockBarLegend />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Product / Grade</th>
                    <th className="px-4 py-3 font-medium">Warehouse</th>
                    <th className="px-4 py-3 font-medium">Composition</th>
                    <th className="px-4 py-3 font-medium">On Hand</th>
                    <th className="px-4 py-3 font-medium">Sellable</th>
                    <th className="px-4 py-3 font-medium">MOQ</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Updated</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => {
                    const itemStatus = inventoryItemStatus(item);
                    return (
                      <tr
                        key={item.id}
                        className="border-t border-slate-100 hover:bg-slate-50/80"
                      >
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className="text-left font-medium text-slate-900 hover:text-[#1B6EF3]"
                            onClick={() => setDetailId(item.id)}
                          >
                            {item.gradeName}
                          </button>
                          <p className="text-xs text-slate-500">
                            {item.gradeCode} · {item.category}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-slate-800">{item.warehouseName}</p>
                          <p className="text-xs text-slate-500">
                            {item.warehouseCity || "—"}
                          </p>
                        </td>
                        <td className="min-w-[160px] px-4 py-3">
                          <StockCompositionBar item={item} />
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          {formatQty(item.onHandQuantity)}
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
                          {formatQty(item.sellableQuantity)}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-slate-600">
                          {formatQty(item.moq)}
                        </td>
                        <td className="px-4 py-3">
                          <SellerStatusBadge status={itemStatus} />
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {formatRelativeTime(item.updatedAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              className="h-8 px-3 text-xs"
                              onClick={() => openAdjust(item)}
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
                                  onClick={() => setDetailId(item.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`${ROUTES.OFFERS_NEW}?productId=${item.productId}`}
                                  >
                                    Create Offer
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`${ROUTES.PRODUCTS}/${item.productId}`}
                                  >
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

          <div className="space-y-3 md:hidden">
            {rows.map((item) => {
              const itemStatus = inventoryItemStatus(item);
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <button
                        type="button"
                        className="text-left font-medium text-slate-900"
                        onClick={() => setDetailId(item.id)}
                      >
                        {item.gradeName}
                      </button>
                      <p className="text-xs text-slate-500">
                        {item.warehouseName}
                        {item.warehouseCity ? ` · ${item.warehouseCity}` : ""}
                      </p>
                    </div>
                    <SellerStatusBadge status={itemStatus} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-[11px] text-slate-400">On hand</p>
                      <p className="font-semibold">
                        {formatQty(item.onHandQuantity)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">Sellable</p>
                      <p className="font-semibold text-[#1B6EF3]">
                        {formatQty(item.sellableQuantity)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">MOQ</p>
                      <p className="font-semibold">{formatQty(item.moq)}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => openAdjust(item)}
                  >
                    Update stock
                  </Button>
                </div>
              );
            })}
          </div>
        </>
      )}

      <InventoryDetailDrawer
        product={detail ? toSellerProductCompat(detail) : null}
        location={
          detail
            ? {
                id: detail.warehouseId,
                name: detail.warehouseName,
                city: detail.warehouseCity,
                state: "",
                warehouse: detail.warehouseName,
                status: "active",
                availableStockMt: detail.onHandQuantity,
                activeOffers: 0,
                activeOrders: 0,
                decisionMaker: "",
                decisionMakerRole: "",
              }
            : undefined
        }
        movements={
          latestMovement &&
          detail &&
          latestMovement.productId === detail.productId
            ? [
                {
                  id: latestMovement.id,
                  productId: latestMovement.productId,
                  delta: latestMovement.quantityDelta,
                  reason:
                    latestMovement.notes ?? movementLabel(latestMovement.type),
                  at: latestMovement.timestamp,
                },
              ]
            : []
        }
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
        product={adjustItem ? toSellerProductCompat(adjustItem) : null}
        products={adjustProducts}
        onOpenChange={(open) => {
          setAdjustOpen(open);
          if (!open) setAdjustId(null);
        }}
        onSave={async (productId, delta, reason) => {
          const target =
            items.find((item) => item.productId === productId) ??
            items.find((item) => item.id === productId);
          if (!target?.inventoryId) {
            toast.error("No inventory linked for this grade.");
            return;
          }
          const result = await adjustStock(target.inventoryId, delta, reason);
          if (!result.ok) {
            toast.error(result.message ?? "Unable to adjust stock.");
            return;
          }
          toast.success(
            `${target.gradeName} ${delta >= 0 ? "increased" : "reduced"} by ${formatQty(Math.abs(delta))}`,
          );
        }}
      />
    </PageContainer>
  );
}
