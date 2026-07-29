"use client";

import { format, parseISO } from "date-fns";
import { Eye, FileText, MoreHorizontal, Upload } from "lucide-react";

import { StatusBadge } from "@/components/shipments/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Shipment } from "@/types/shipments";

interface ShipmentRowProps {
  shipment: Shipment;
  active?: boolean;
  onSelect: () => void;
  onView: () => void;
  onGenerateInvoice: () => void;
  onGenerateEway: () => void;
  onUploadPod: () => void;
  onMarkDelivered: () => void;
}

export function ShipmentRow({
  shipment,
  active,
  onSelect,
  onView,
  onGenerateInvoice,
  onGenerateEway,
  onUploadPod,
  onMarkDelivered,
}: ShipmentRowProps) {
  const canMarkDelivered =
    shipment.status !== "delivered" && shipment.status !== "pending";
  const needsInvoice = !shipment.invoiceNumber;
  const needsEway = !shipment.ewayBillNumber && shipment.status !== "pending";
  const needsPod =
    shipment.documents.find((d) => d.type === "pod")?.status === "missing";

  let primaryLabel = "VIEW SHIPMENT";
  let primaryAction = onView;
  let primaryClass = "bg-[#0B1F3A] hover:bg-[#16345A]";

  if (needsInvoice && shipment.status !== "pending") {
    primaryLabel = "GENERATE INVOICE";
    primaryAction = onGenerateInvoice;
    primaryClass = "bg-[#1B6EF3] hover:bg-[#1558C9]";
  } else if (needsEway) {
    primaryLabel = "GENERATE E-WAY";
    primaryAction = onGenerateEway;
    primaryClass = "bg-teal-600 hover:bg-teal-700";
  } else if (needsPod && canMarkDelivered) {
    primaryLabel = "UPLOAD POD";
    primaryAction = onUploadPod;
    primaryClass = "bg-[#0B1F3A] hover:bg-[#16345A]";
  } else if (canMarkDelivered) {
    primaryLabel = "MARK DELIVERED";
    primaryAction = onMarkDelivered;
    primaryClass = "bg-emerald-600 hover:bg-emerald-700";
  }

  return (
    <TableRow
      className={cn(
        "cursor-pointer transition-colors",
        active ? "bg-[#E8F1FF]/60" : "hover:bg-slate-50",
      )}
      onClick={onSelect}
    >
      <TableCell className="font-semibold text-slate-900">
        {shipment.shipmentId}
      </TableCell>
      <TableCell className="text-sm text-slate-700">
        {shipment.orderId}
      </TableCell>
      <TableCell className="max-w-[160px] truncate text-sm text-slate-700">
        {shipment.buyerCompany}
      </TableCell>
      <TableCell className="max-w-[140px] truncate text-sm text-slate-600">
        {shipment.product}
      </TableCell>
      <TableCell className="text-sm font-medium text-slate-700">
        {shipment.quantityMt.toFixed(1)}
      </TableCell>
      <TableCell className="text-sm text-slate-600">
        {shipment.vehicle}
      </TableCell>
      <TableCell className="max-w-[130px] truncate text-sm text-slate-600">
        {shipment.transporter}
      </TableCell>
      <TableCell className="text-sm text-slate-600">
        {format(parseISO(shipment.dispatchDate), "dd MMM, yyyy")}
      </TableCell>
      <TableCell className="text-sm text-slate-600">
        {format(parseISO(shipment.expectedDelivery), "dd MMM, yyyy")}
      </TableCell>
      <TableCell>
        <StatusBadge status={shipment.status} isDelayed={shipment.isDelayed} />
      </TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          <Button
            size="sm"
            className={cn(
              "h-8 px-3 text-[11px] font-bold uppercase",
              primaryClass,
            )}
            onClick={primaryAction}
          >
            {primaryLabel}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="mr-2 h-4 w-4" />
                View Shipment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onGenerateInvoice}>
                <FileText className="mr-2 h-4 w-4" />
                Generate Invoice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onGenerateEway}>
                <FileText className="mr-2 h-4 w-4" />
                Generate E-Way
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onUploadPod}>
                <Upload className="mr-2 h-4 w-4" />
                Upload POD
              </DropdownMenuItem>
              {canMarkDelivered ? (
                <DropdownMenuItem onClick={onMarkDelivered}>
                  Mark Delivered
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
