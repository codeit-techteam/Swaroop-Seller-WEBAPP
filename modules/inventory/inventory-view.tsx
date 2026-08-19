"use client";

import { History, MoreHorizontal, Package, Pencil } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import {
  ActionDrawer,
  ErpPagination,
  ExportDropdown,
  inventoryStatusLabel,
  inventoryStatusVariant,
  MarketplaceOfferButton,
  MetricCard,
  StatusChip,
  StockMovementTimeline,
  SummaryCard,
} from "@/components/erp";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/lib/constants";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import {
  inventoryCategories,
  inventoryGrades,
  inventoryStatuses,
  inventoryWarehouses,
} from "@/mock/inventory";
import { useInventoryStore } from "@/store/inventoryStore";
import type { InventoryItem } from "@/types/inventory";

function InventoryRow({
  item,
  selected,
  active,
  onSelect,
  onOpen,
}: {
  item: InventoryItem;
  selected: boolean;
  active: boolean;
  onSelect: () => void;
  onOpen: () => void;
}) {
  return (
    <TableRow
      className={cn(
        "cursor-pointer hover:bg-slate-50/80",
        active && "bg-[#F5F9FF] ring-1 ring-inset ring-[#1B6EF3]/30",
      )}
      onClick={onOpen}
    >
      <TableCell onClick={(event) => event.stopPropagation()}>
        <Checkbox checked={selected} onCheckedChange={onSelect} />
      </TableCell>
      <TableCell>
        <div>
          <p className="font-semibold text-slate-800">{item.productName}</p>
          <p className="text-xs text-slate-400">SKU: {item.sku}</p>
        </div>
      </TableCell>
      <TableCell className="text-slate-600">{item.category}</TableCell>
      <TableCell className="text-slate-600">{item.warehouseName}</TableCell>
      <TableCell
        className={cn(
          "tabular-nums font-medium",
          item.status === "LOW_STOCK" ? "text-red-600" : "text-slate-800",
        )}
      >
        {formatNumber(item.availableMt, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </TableCell>
      <TableCell className="tabular-nums text-slate-700">
        {formatCurrency(item.offerPrice)}
      </TableCell>
      <TableCell>
        <StatusChip
          label={inventoryStatusLabel(item.status)}
          variant={inventoryStatusVariant(item.status)}
        />
      </TableCell>
      <TableCell onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => toast.success(`History for ${item.sku}`)}
          >
            <History className="h-4 w-4 text-slate-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => toast.success(`Edit ${item.sku}`)}
          >
            <Pencil className="h-4 w-4 text-slate-500" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onOpen}>View</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.success(`Editing ${item.productName}`)}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  toast.success(`Stock update for ${item.productName}`)
                }
              >
                Update
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.success(`History for ${item.productName}`)}
              >
                History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function InventoryView() {
  const filters = useInventoryStore((s) => s.filters);
  const summaryBase = useInventoryStore((s) => s.summary);
  const setFilter = useInventoryStore((s) => s.setFilter);
  const resetFilters = useInventoryStore((s) => s.resetFilters);
  const page = useInventoryStore((s) => s.page);
  const pageSize = useInventoryStore((s) => s.pageSize);
  const sort = useInventoryStore((s) => s.sort);
  const setPage = useInventoryStore((s) => s.setPage);
  const setSort = useInventoryStore((s) => s.setSort);
  const selectedIds = useInventoryStore((s) => s.selectedIds);
  const toggleSelected = useInventoryStore((s) => s.toggleSelected);
  const toggleSelectAll = useInventoryStore((s) => s.toggleSelectAll);
  const selectedProduct = useInventoryStore((s) => s.selectedProduct);
  const drawerOpen = useInventoryStore((s) => s.drawerOpen);
  const openDrawer = useInventoryStore((s) => s.openDrawer);
  const closeDrawer = useInventoryStore((s) => s.closeDrawer);
  const getFilteredProducts = useInventoryStore((s) => s.getFilteredProducts);
  const getPaginatedProducts = useInventoryStore((s) => s.getPaginatedProducts);
  const getComputedSummary = useInventoryStore((s) => s.getComputedSummary);

  void sort;

  const filtered = getFilteredProducts();
  const products = getPaginatedProducts();
  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    filters.grade !== "All Grades" ||
    filters.category !== "All Categories" ||
    filters.warehouse !== "All Warehouses" ||
    filters.status !== "Status: Any";
  const summary = hasActiveFilters ? getComputedSummary() : summaryBase;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageIds = products.map((item) => item.id);
  const allSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Marketplace &gt; Inventory Management
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Inventory Overview
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ExportDropdown label="Report" variant="outline" />
          <Button
            variant="outline"
            className="border-slate-200"
            asChild
          >
            <Link href={ROUTES.INVENTORY_RESERVATIONS}>Reserve Stock</Link>
          </Button>
          <Button className="gap-2 bg-[#0B1F3A] hover:bg-[#122846]" asChild>
            <Link href={ROUTES.INVENTORY_ADD_PRODUCT}>+ Add Stock</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          title="Total Inventory"
          value={summary.totalInventory}
          suffix={summary.unit}
        />
        <SummaryCard
          title="Available"
          value={summary.available}
          suffix={summary.unit}
          valueClassName="text-[#1B6EF3]"
        />
        <SummaryCard
          title="Reserved"
          value={summary.reserved}
          suffix={summary.unit}
        />
        <SummaryCard
          title="Low Stock"
          value={summary.lowStock}
          valueClassName="text-red-600"
        />
        <SummaryCard title="Warehouses" value={summary.warehouses} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.grade}
            onValueChange={(value) => setFilter("grade", value)}
          >
            <SelectTrigger className="h-9 w-[150px] border-slate-200 bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {inventoryGrades.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.category}
            onValueChange={(value) => setFilter("category", value)}
          >
            <SelectTrigger className="h-9 w-[160px] border-slate-200 bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {inventoryCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.warehouse}
            onValueChange={(value) => setFilter("warehouse", value)}
          >
            <SelectTrigger className="h-9 w-[190px] border-slate-200 bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {inventoryWarehouses.map((warehouse) => (
                <SelectItem key={warehouse} value={warehouse}>
                  {warehouse}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(value) => setFilter("status", value)}
          >
            <SelectTrigger className="h-9 w-[150px] border-slate-200 bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {inventoryStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === "IN_STOCK"
                    ? "In Stock"
                    : status === "LOW_STOCK"
                      ? "Low Stock"
                      : status === "OUT_OF_STOCK"
                        ? "Out of Stock"
                        : status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-9 border-slate-200"
            onClick={() => {
              resetFilters();
              toast.success("Filters reset");
            }}
          >
            Reset
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold uppercase tracking-wide text-slate-400">
            Bulk Actions:
          </span>
          <button
            type="button"
            className="font-medium text-slate-700 hover:text-[#1B6EF3]"
            onClick={() => toast.success("Import started (mock)")}
          >
            Import
          </button>
          <button
            type="button"
            className="font-medium text-slate-700 hover:text-[#1B6EF3]"
            onClick={() =>
              toast.success(
                selectedIds.length
                  ? `Exported ${selectedIds.length} items (mock)`
                  : "Exported all filtered items (mock)",
              )
            }
          >
            Export
          </button>
          <button
            type="button"
            className="font-medium text-slate-700 hover:text-[#1B6EF3]"
            onClick={() =>
              toast.success(
                selectedIds.length
                  ? `Adjust stock for ${selectedIds.length} items (mock)`
                  : "Select rows to adjust stock",
              )
            }
          >
            Adjust Stock
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-slate-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={() => toggleSelectAll(pageIds)}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                  onClick={() => setSort("productName")}
                >
                  Product Grade
                </TableHead>
                <TableHead
                  className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                  onClick={() => setSort("category")}
                >
                  Category
                </TableHead>
                <TableHead
                  className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                  onClick={() => setSort("warehouseName")}
                >
                  Warehouse
                </TableHead>
                <TableHead
                  className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                  onClick={() => setSort("availableMt")}
                >
                  Available (MT)
                </TableHead>
                <TableHead
                  className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                  onClick={() => setSort("offerPrice")}
                >
                  Offer Price
                </TableHead>
                <TableHead
                  className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                  onClick={() => setSort("status")}
                >
                  Status
                </TableHead>
                <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((item) => (
                <InventoryRow
                  key={item.id}
                  item={item}
                  selected={selectedIds.includes(item.id)}
                  active={selectedProduct?.id === item.id && drawerOpen}
                  onSelect={() => toggleSelected(item.id)}
                  onOpen={() => openDrawer(item)}
                />
              ))}
              {products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-sm text-slate-500"
                  >
                    No inventory items match your filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
        <ErpPagination
          page={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>

      <ActionDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title="Product Details"
        footer={<MarketplaceOfferButton />}
      >
        {selectedProduct ? (
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F1FF] text-[#1B6EF3]">
                <Package className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedProduct.grade.startsWith("PP")
                    ? `PP Grade ${selectedProduct.grade.replace(/^PP\s*/, "")}`
                    : selectedProduct.grade}
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedProduct.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="MOQ"
                value={`${selectedProduct.moq.toFixed(2)} MT`}
              />
              <MetricCard label="Origin" value={selectedProduct.origin} />
            </div>

            <div className="rounded-xl bg-[#0B1F3A] p-4 text-white">
              <p className="text-sm font-semibold">
                {selectedProduct.warehouseName}
              </p>
              <p className="mt-1 text-xs text-slate-300">
                {selectedProduct.warehouseAddress}
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>
                    {selectedProduct.capacityUtilized}% Capacity Utilized
                  </span>
                </div>
                <Progress
                  value={selectedProduct.capacityUtilized}
                  className="h-2 bg-white/15"
                />
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-slate-900">
                Stock Movement Timeline
              </h4>
              <StockMovementTimeline movements={selectedProduct.movements} />
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">
                Documents
              </h4>
              <ul className="space-y-2">
                {selectedProduct.documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-slate-700">
                      {doc.name}
                    </span>
                    <span className="text-xs text-slate-400">{doc.type}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">
                Compliance
              </h4>
              <ul className="space-y-1">
                {selectedProduct.complianceNotes.map((note) => (
                  <li key={note} className="text-sm text-slate-600">
                    • {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </ActionDrawer>
    </div>
  );
}
