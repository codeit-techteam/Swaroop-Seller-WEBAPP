"use client";

import { CalendarClock, MoreVertical } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/dispatch/pagination";
import { SlotStatusBadge } from "@/components/slot-booking/slot-status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { SlotBooking } from "@/types/slot-booking";

interface VehicleSlotTableProps {
  slots: SlotBooking[];
  selectedId?: string | null;
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading?: boolean;
  hasFilters?: boolean;
  onPageChange: (page: number) => void;
  onSelect: (slot: SlotBooking) => void;
  onModify: (slot: SlotBooking) => void;
  onCancel: (slot: SlotBooking) => void;
  onDownloadGatePass: (slot: SlotBooking) => void;
  className?: string;
}

export function VehicleSlotTable({
  slots,
  selectedId,
  totalItems,
  page,
  pageSize,
  totalPages,
  isLoading,
  hasFilters,
  onPageChange,
  onSelect,
  onModify,
  onCancel,
  onDownloadGatePass,
  className,
}: VehicleSlotTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-800">
          Booked Appointments
        </h3>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Slot ID
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Warehouse
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Vehicle
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Bay
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
                  <TableRow key={`sk-${index}`}>
                    {Array.from({ length: 6 }).map((__, cell) => (
                      <td key={cell} className="p-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </TableRow>
                ))
              : null}

            {!isLoading &&
              slots.map((slot) => (
                <TableRow
                  key={slot.id}
                  className={cn(
                    "cursor-pointer",
                    selectedId === slot.id
                      ? "bg-[#E8F1FF]/60"
                      : "hover:bg-slate-50",
                  )}
                  onClick={() => onSelect(slot)}
                >
                  <TableCell className="font-bold text-slate-900">
                    {slot.slotId}
                  </TableCell>
                  <TableCell className="text-sm text-slate-700">
                    {slot.warehouseLabel}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-slate-700">
                    {slot.vehicleNumber}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-slate-700">
                    {slot.bay}
                  </TableCell>
                  <TableCell>
                    <SlotStatusBadge status={slot.status} />
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onSelect(slot)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDownloadGatePass(slot)}
                        >
                          Download Gate Pass
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={
                            slot.status === "cancelled" ||
                            slot.status === "completed"
                          }
                          onClick={() => onModify(slot)}
                        >
                          Modify Slot
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={
                            slot.status === "cancelled" ||
                            slot.status === "completed"
                          }
                          className="text-red-600"
                          onClick={() => onCancel(slot)}
                        >
                          Cancel Slot
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {!isLoading && slots.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={CalendarClock}
            title="No Slot Bookings Found"
            description={
              hasFilters
                ? "No appointments match your current filters."
                : "There are no booked appointments yet."
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
          label="slots"
        />
      ) : null}
    </div>
  );
}
