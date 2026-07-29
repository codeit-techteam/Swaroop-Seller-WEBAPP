"use client";

import { PackageOpen, RefreshCw } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { FilterBar } from "@/components/orders/filter-bar";
import { OrderRow } from "@/components/orders/order-row";
import { Pagination } from "@/components/orders/pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Order, OrderFilters } from "@/types/orders";

interface OrdersTableProps {
  orders: Order[];
  selectedId?: string | null;
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading?: boolean;
  hasError?: boolean;
  hasFilters?: boolean;
  filters: OrderFilters;
  onFilterChange: <K extends keyof OrderFilters>(
    key: K,
    value: OrderFilters[K],
  ) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onSelect: (order: Order) => void;
  onDownloadInvoice: (order: Order) => void;
  onPrint: (order: Order) => void;
  onViewDetails: (order: Order) => void;
  onRetry?: () => void;
  className?: string;
}

export function OrdersTable({
  orders,
  selectedId,
  totalItems,
  page,
  pageSize,
  totalPages,
  isLoading,
  hasError,
  hasFilters,
  filters,
  onFilterChange,
  onSearchChange,
  onClearFilters,
  onPageChange,
  onSelect,
  onDownloadInvoice,
  onPrint,
  onViewDetails,
  onRetry,
  className,
}: OrdersTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <FilterBar
        filters={filters}
        onFilterChange={onFilterChange}
        onSearchChange={onSearchChange}
        onClear={onClearFilters}
      />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Order ID / Status
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Product Grade
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Qty (MT)
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Warehouse
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Dispatch
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                ETA
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Payment
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <TableCell key={`sk-${i}-${j}`}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : hasError ? (
              <TableRow>
                <TableCell colSpan={8} className="p-0">
                  <div className="flex flex-col items-center gap-3 py-16">
                    <p className="text-sm font-medium text-slate-700">
                      Failed to load orders
                    </p>
                    <Button
                      variant="outline"
                      className="gap-2 border-slate-200"
                      onClick={onRetry}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="p-0">
                  <EmptyState
                    icon={PackageOpen}
                    title="No Orders"
                    description={
                      hasFilters
                        ? "No orders match your current filters. Try clearing filters."
                        : "There are no orders in this tab yet."
                    }
                    className="border-0 py-16 shadow-none"
                  />
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  selected={selectedId === order.id}
                  onSelect={onSelect}
                  onDownloadInvoice={onDownloadInvoice}
                  onPrint={onPrint}
                  onViewDetails={onViewDetails}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && !hasError && totalItems > 0 ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      ) : null}
    </div>
  );
}
