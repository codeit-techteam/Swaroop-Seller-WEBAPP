"use client";

import { Package } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/shipments/pagination";
import { ShipmentRow } from "@/components/shipments/shipment-row";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Shipment } from "@/types/shipments";

interface ShipmentTableProps {
  shipments: Shipment[];
  selectedId?: string | null;
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading?: boolean;
  hasFilters?: boolean;
  onPageChange: (page: number) => void;
  onSelect: (shipment: Shipment) => void;
  onView: (shipment: Shipment) => void;
  onGenerateInvoice: (shipment: Shipment) => void;
  onGenerateEway: (shipment: Shipment) => void;
  onUploadPod: (shipment: Shipment) => void;
  onMarkDelivered: (shipment: Shipment) => void;
  className?: string;
}

const COLUMN_COUNT = 7;

export function ShipmentTable({
  shipments,
  selectedId,
  totalItems,
  page,
  pageSize,
  totalPages,
  isLoading,
  hasFilters,
  onPageChange,
  onSelect,
  onView,
  onGenerateInvoice,
  onGenerateEway,
  onUploadPod,
  onMarkDelivered,
  className,
}: ShipmentTableProps) {
  return (
    <TooltipProvider delayDuration={250}>
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
          className,
        )}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-slate-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[160px] text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Shipment / Status
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Order
                </TableHead>
                <TableHead className="min-w-[180px] text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Buyer / Product
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Qty (MT)
                </TableHead>
                <TableHead className="min-w-[150px] text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Logistics
                </TableHead>
                <TableHead className="min-w-[120px] text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Schedule
                </TableHead>
                <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      {Array.from({ length: COLUMN_COUNT }).map((__, cell) => (
                        <td key={cell} className="p-4">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </TableRow>
                  ))
                : null}

              {!isLoading &&
                shipments.map((shipment) => (
                  <ShipmentRow
                    key={shipment.id}
                    shipment={shipment}
                    active={selectedId === shipment.id}
                    onSelect={() => onSelect(shipment)}
                    onView={() => onView(shipment)}
                    onGenerateInvoice={() => onGenerateInvoice(shipment)}
                    onGenerateEway={() => onGenerateEway(shipment)}
                    onUploadPod={() => onUploadPod(shipment)}
                    onMarkDelivered={() => onMarkDelivered(shipment)}
                  />
                ))}
            </TableBody>
          </Table>
        </div>

        {!isLoading && shipments.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Package}
              title="No Shipments Found"
              description={
                hasFilters
                  ? "No shipments match your current filters or search."
                  : "There are no shipments in this tab yet."
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
    </TooltipProvider>
  );
}
