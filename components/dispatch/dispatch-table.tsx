"use client";

import { Download, Filter, Truck } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { DispatchRow } from "@/components/dispatch/dispatch-row";
import { Pagination } from "@/components/dispatch/pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { DispatchOrder } from "@/types/dispatch";

interface DispatchTableProps {
  dispatches: DispatchOrder[];
  selectedId?: string | null;
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading?: boolean;
  hasFilters?: boolean;
  onPageChange: (page: number) => void;
  onSelect: (dispatch: DispatchOrder) => void;
  onAssignTruck: (dispatch: DispatchOrder) => void;
  onGenerateEway: (dispatch: DispatchOrder) => void;
  onRelease: (dispatch: DispatchOrder) => void;
  onView: (dispatch: DispatchOrder) => void;
  onExport?: () => void;
  onOpenFilters?: () => void;
  className?: string;
}

export function DispatchTable({
  dispatches,
  selectedId,
  totalItems,
  page,
  pageSize,
  totalPages,
  isLoading,
  hasFilters,
  onPageChange,
  onSelect,
  onAssignTruck,
  onGenerateEway,
  onRelease,
  onView,
  onExport,
  onOpenFilters,
  className,
}: DispatchTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          Active Dispatch Queue
        </h3>
        <div className="flex items-center gap-1">
          {onOpenFilters ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500"
              onClick={onOpenFilters}
              aria-label="Filters"
            >
              <Filter className="h-4 w-4" />
            </Button>
          ) : null}
          {onExport ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500"
              onClick={onExport}
              aria-label="Export"
            >
              <Download className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Order ID
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Buyer
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Material
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Qty
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Destination
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Deadline
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Status
              </TableHead>
              <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {Array.from({ length: 8 }).map((__, cell) => (
                      <td key={cell} className="p-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </TableRow>
                ))
              : null}

            {!isLoading &&
              dispatches.map((dispatch) => (
                <DispatchRow
                  key={dispatch.id}
                  dispatch={dispatch}
                  active={selectedId === dispatch.id}
                  onSelect={() => onSelect(dispatch)}
                  onAssignTruck={() => onAssignTruck(dispatch)}
                  onGenerateEway={() => onGenerateEway(dispatch)}
                  onRelease={() => onRelease(dispatch)}
                  onView={() => onView(dispatch)}
                />
              ))}
          </TableBody>
        </Table>
      </div>

      {!isLoading && dispatches.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={Truck}
            title="No Dispatch Found"
            description={
              hasFilters
                ? "No dispatches match your current filters or search."
                : "There are no dispatches in this queue yet."
            }
          />
        </div>
      ) : null}

      {!isLoading && totalItems > 0 ? (
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
