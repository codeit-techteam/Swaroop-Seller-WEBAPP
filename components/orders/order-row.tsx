"use client";

import { Download, Printer } from "lucide-react";
import Link from "next/link";

import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/orders";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface OrderRowProps {
  order: Order;
  selected?: boolean;
  onSelect: (order: Order) => void;
  onDownloadInvoice: (order: Order) => void;
  onPrint: (order: Order) => void;
  onViewDetails: (order: Order) => void;
}

export function OrderRow({
  order,
  selected,
  onSelect,
  onDownloadInvoice,
  onPrint,
  onViewDetails,
}: OrderRowProps) {
  return (
    <TableRow
      className={cn(
        "cursor-pointer transition-colors",
        selected
          ? "border-l-4 border-l-[#1B6EF3] bg-[#F5F9FF] hover:bg-[#F0F6FF]"
          : "border-l-4 border-l-transparent hover:bg-slate-50",
      )}
      onClick={() => onSelect(order)}
    >
      <TableCell className="align-top">
        <Link
          href={`${ROUTES.ORDERS}/${order.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-sm font-semibold text-[#1B6EF3] hover:underline"
        >
          {order.orderNumber}
        </Link>
        <div className="mt-1.5">
          <OrderStatusBadge status={order.status} />
        </div>
      </TableCell>
      <TableCell className="text-sm font-medium text-slate-800">
        {order.productGrade}
      </TableCell>
      <TableCell className="text-sm font-semibold tabular-nums text-slate-800">
        {order.quantityMt.toFixed(2)}
      </TableCell>
      <TableCell className="text-sm text-slate-700">
        {order.warehouseLabel}
      </TableCell>
      <TableCell className="text-sm tabular-nums text-slate-700">
        {formatDate(order.dispatchDate)}
      </TableCell>
      <TableCell className="text-sm tabular-nums text-slate-700">
        {formatDate(order.eta)}
      </TableCell>
      <TableCell>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(order);
          }}
          className="text-sm font-medium text-[#1B6EF3] hover:underline"
        >
          {order.paymentLabel}
        </button>
      </TableCell>
      <TableCell>
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-[#1B6EF3]"
            onClick={() => onDownloadInvoice(order)}
            aria-label="Download invoice"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-slate-800"
            onClick={() => onPrint(order)}
            aria-label="Print order"
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            className="ml-1 h-8 bg-[#0B1F3A] px-3 text-xs font-semibold hover:bg-[#122846]"
            onClick={() => onViewDetails(order)}
          >
            View Details
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
