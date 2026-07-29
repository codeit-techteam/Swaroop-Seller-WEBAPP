"use client";

import { motion } from "framer-motion";
import { Download, Package } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/shipments/pagination";
import { ShipmentRow } from "@/components/shipments/shipment-row";
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
  onExport?: () => void;
  className?: string;
}

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
  onExport,
  className,
}: ShipmentTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          Shipment Registry
        </h3>
        {onExport ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-slate-500"
            onClick={onExport}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Shipment ID
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Order ID
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Buyer
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Product
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Qty (MT)
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Vehicle
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Transporter
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Dispatch Date
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Exp. Delivery
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
                    {Array.from({ length: 11 }).map((__, cell) => (
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
    </motion.div>
  );
}
