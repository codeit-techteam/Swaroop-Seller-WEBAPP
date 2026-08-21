"use client";

import { format, parseISO } from "date-fns";
import {
  CheckCircle2,
  Eye,
  FileText,
  MoreHorizontal,
  Truck,
  Upload,
} from "lucide-react";

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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

type PrimaryAction = {
  label: string;
  onClick: () => void;
  variant: "default" | "outline";
  className?: string;
};

function getPrimaryAction(
  shipment: Shipment,
  handlers: {
    onView: () => void;
    onGenerateInvoice: () => void;
    onGenerateEway: () => void;
    onUploadPod: () => void;
    onMarkDelivered: () => void;
  },
): PrimaryAction {
  const canMarkDelivered =
    shipment.status !== "delivered" && shipment.status !== "pending";
  const needsInvoice = !shipment.invoiceNumber;
  const needsEway = !shipment.ewayBillNumber && shipment.status !== "pending";
  const needsPod =
    shipment.documents.find((d) => d.type === "pod")?.status === "missing";

  if (needsInvoice && shipment.status !== "pending") {
    return {
      label: "Invoice",
      onClick: handlers.onGenerateInvoice,
      variant: "default",
      className: "bg-[#1B6EF3] hover:bg-[#1558C9]",
    };
  }
  if (needsEway) {
    return {
      label: "E-Way",
      onClick: handlers.onGenerateEway,
      variant: "default",
      className: "bg-teal-600 hover:bg-teal-700",
    };
  }
  if (needsPod && canMarkDelivered) {
    return {
      label: "Upload POD",
      onClick: handlers.onUploadPod,
      variant: "outline",
      className: "border-slate-300 text-slate-700 hover:bg-slate-50",
    };
  }
  if (canMarkDelivered) {
    return {
      label: "Deliver",
      onClick: handlers.onMarkDelivered,
      variant: "default",
      className: "bg-emerald-600 hover:bg-emerald-700",
    };
  }
  return {
    label: "View",
    onClick: handlers.onView,
    variant: "outline",
    className: "border-slate-300 text-slate-700 hover:bg-slate-50",
  };
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

  const primary = getPrimaryAction(shipment, {
    onView,
    onGenerateInvoice,
    onGenerateEway,
    onUploadPod,
    onMarkDelivered,
  });

  return (
    <TableRow
      className={cn(
        "cursor-pointer transition-colors",
        active
          ? "border-l-4 border-l-[#1B6EF3] bg-[#F5F9FF] hover:bg-[#F0F6FF]"
          : "border-l-4 border-l-transparent hover:bg-slate-50",
      )}
      onClick={onSelect}
    >
      <TableCell className="align-top">
        <p className="text-sm font-semibold text-slate-900">
          {shipment.shipmentId}
        </p>
        <div className="mt-1.5">
          <StatusBadge
            status={shipment.status}
            isDelayed={shipment.isDelayed}
          />
        </div>
      </TableCell>

      <TableCell className="align-top">
        <p className="text-sm font-medium text-[#1B6EF3]">{shipment.orderId}</p>
      </TableCell>

      <TableCell className="align-top">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="max-w-[220px]">
              <p className="truncate text-sm font-medium text-slate-800">
                {shipment.buyerCompany}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {shipment.product}
              </p>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="font-medium">{shipment.buyerCompany}</p>
            <p className="text-slate-300">{shipment.product}</p>
          </TooltipContent>
        </Tooltip>
      </TableCell>

      <TableCell className="align-top">
        <p className="text-sm font-semibold tabular-nums text-slate-800">
          {shipment.quantityMt.toFixed(1)}
        </p>
      </TableCell>

      <TableCell className="align-top">
        <p className="text-sm font-medium tabular-nums text-slate-800">
          {shipment.vehicle}
        </p>
        <p
          className="mt-0.5 max-w-[160px] truncate text-xs text-slate-500"
          title={shipment.transporter}
        >
          {shipment.transporter}
        </p>
      </TableCell>

      <TableCell className="align-top">
        <p className="text-sm tabular-nums text-slate-700">
          {format(parseISO(shipment.dispatchDate), "dd MMM yyyy")}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          ETA {format(parseISO(shipment.expectedDelivery), "dd MMM")}
        </p>
      </TableCell>

      <TableCell className="text-right align-top" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          <Button
            size="sm"
            variant={primary.variant}
            className={cn("h-8 px-3 text-xs font-semibold", primary.className)}
            onClick={primary.onClick}
          >
            {primary.label}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500"
                aria-label="More actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onView}>
                <Eye className="mr-2 h-4 w-4" />
                View shipment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onGenerateInvoice}>
                <FileText className="mr-2 h-4 w-4" />
                Generate invoice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onGenerateEway}>
                <Truck className="mr-2 h-4 w-4" />
                Generate e-way
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onUploadPod}>
                <Upload className="mr-2 h-4 w-4" />
                Upload POD
              </DropdownMenuItem>
              {canMarkDelivered ? (
                <DropdownMenuItem onClick={onMarkDelivered}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark delivered
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
