"use client";

import { ClipboardList } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PurchasePagination } from "@/components/purchase-requests/purchase-pagination";
import { RequestRow } from "@/components/purchase-requests/request-row";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { PurchaseRequest } from "@/types/purchase-requests";

interface PurchaseRequestTableProps {
  requests: PurchaseRequest[];
  selectedId?: string | null;
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading?: boolean;
  hasFilters?: boolean;
  embedded?: boolean;
  onPageChange: (page: number) => void;
  onSelect: (request: PurchaseRequest) => void;
  onAccept: (request: PurchaseRequest) => void;
  onReject: (request: PurchaseRequest) => void;
  onCounter: (request: PurchaseRequest) => void;
  onViewOrder: (request: PurchaseRequest) => void;
  onHistory: (request: PurchaseRequest) => void;
  onViewCounter: (request: PurchaseRequest) => void;
  className?: string;
}

export function PurchaseRequestTable({
  requests,
  selectedId,
  totalItems,
  page,
  pageSize,
  totalPages,
  isLoading,
  hasFilters,
  embedded = false,
  onPageChange,
  onSelect,
  onAccept,
  onReject,
  onCounter,
  onViewOrder,
  onHistory,
  onViewCounter,
  className,
}: PurchaseRequestTableProps) {
  return (
    <div
      className={cn(
        embedded
          ? "overflow-hidden"
          : "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Request ID
              </TableHead>
              <TableHead className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Product Grade
              </TableHead>
              <TableHead className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Quantity
              </TableHead>
              <TableHead className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Warehouse Pickup
              </TableHead>
              <TableHead className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Dispatch Deadline
              </TableHead>
              <TableHead className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Status
              </TableHead>
              <TableHead className="px-4 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {Array.from({ length: 7 }).map((__, cell) => (
                      <td key={cell} className="p-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </TableRow>
                ))
              : null}

            {!isLoading &&
              requests.map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  active={selectedId === request.id}
                  onSelect={() => onSelect(request)}
                  onAccept={() => onAccept(request)}
                  onReject={() => onReject(request)}
                  onCounter={() => onCounter(request)}
                  onViewOrder={() => onViewOrder(request)}
                  onHistory={() => onHistory(request)}
                  onViewCounter={() => onViewCounter(request)}
                />
              ))}
          </TableBody>
        </Table>
      </div>

      {!isLoading && requests.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={ClipboardList}
            title={hasFilters ? "No Search Results" : "No Requests"}
            description={
              hasFilters
                ? "No purchase requests match your current filters or search."
                : "There are no purchase requests in your inbox yet."
            }
          />
        </div>
      ) : null}

      {!isLoading && totalItems > 0 ? (
        <PurchasePagination
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
