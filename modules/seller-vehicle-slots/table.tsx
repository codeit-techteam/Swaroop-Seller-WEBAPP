"use client";

import { CalendarClock, Eye, XCircle } from "lucide-react";

import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatMt } from "@/lib/seller/format";
import { formatDate } from "@/lib/utils";
import type { VehicleSlot } from "@/types/seller-ops";

export function VehicleSlotTable({
  rows,
  onView,
  onReschedule,
  onCancel,
}: {
  rows: VehicleSlot[];
  onView: (row: VehicleSlot) => void;
  onReschedule: (row: VehicleSlot) => void;
  onCancel: (row: VehicleSlot) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[1280px] text-left text-sm">
        <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Slot ID</th>
            <th className="px-4 py-3">Order ID</th>
            <th className="px-4 py-3">Warehouse</th>
            <th className="px-4 py-3">Vehicle Number</th>
            <th className="px-4 py-3">Vehicle Type</th>
            <th className="px-4 py-3">Carrier</th>
            <th className="px-4 py-3">Driver</th>
            <th className="px-4 py-3">Scheduled Date</th>
            <th className="px-4 py-3">Time Slot</th>
            <th className="px-4 py-3">Loading Bay</th>
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const active = row.status !== "CANCELLED" && row.status !== "COMPLETED";
            return (
              <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium">{row.id}</td>
                <td className="px-4 py-3">{row.orderId}</td>
                <td className="px-4 py-3">{row.warehouseName}</td>
                <td className="px-4 py-3 font-mono text-xs">{row.vehicleNumber}</td>
                <td className="px-4 py-3">{row.vehicleType}</td>
                <td className="px-4 py-3">{row.carrier}</td>
                <td className="px-4 py-3">{row.driverName}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(row.date)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.timeSlot}</td>
                <td className="px-4 py-3">{row.loadingBay}</td>
                <td className="px-4 py-3">{formatMt(row.quantityMt)}</td>
                <td className="px-4 py-3">
                  <SellerStatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`View ${row.id}`}
                          onClick={() => onView(row)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View</TooltipContent>
                    </Tooltip>
                    {active ? (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label={`Reschedule ${row.id}`}
                              onClick={() => onReschedule(row)}
                            >
                              <CalendarClock className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Reschedule</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label={`Cancel ${row.id}`}
                              onClick={() => onCancel(row)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Cancel</TooltipContent>
                        </Tooltip>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
