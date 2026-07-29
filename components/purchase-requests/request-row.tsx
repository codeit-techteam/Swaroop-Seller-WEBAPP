"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";

import { StatusBadge } from "@/components/purchase-requests/status-badge";
import { TableCell } from "@/components/ui/table";
import { cn, formatNumber } from "@/lib/utils";
import type { PurchaseRequest } from "@/types/purchase-requests";

interface RequestRowProps {
  request: PurchaseRequest;
  active: boolean;
  onSelect: () => void;
  onAccept: () => void;
  onReject: () => void;
  onCounter: () => void;
  onViewOrder: () => void;
  onHistory: () => void;
  onViewCounter: () => void;
}

export function RequestRow({
  request,
  active,
  onSelect,
  onAccept,
  onReject,
  onCounter,
  onViewOrder,
  onHistory,
  onViewCounter,
}: RequestRowProps) {
  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "cursor-pointer border-b transition-colors hover:bg-slate-50/80",
        active && "bg-[#F5F9FF] ring-1 ring-inset ring-[#1B6EF3]/25",
      )}
      onClick={onSelect}
    >
      <TableCell className="font-semibold text-[#1B6EF3]">
        {request.requestNumber}
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium text-slate-800">{request.productName}</p>
          <p className="text-xs text-slate-400">{request.productGrade}</p>
        </div>
      </TableCell>
      <TableCell className="tabular-nums font-medium text-slate-800">
        {formatNumber(request.quantityMt, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}{" "}
        MT
      </TableCell>
      <TableCell className="text-slate-600">{request.warehouseLabel}</TableCell>
      <TableCell className="text-slate-600">
        {format(new Date(request.deadline), "dd MMM yyyy")}
      </TableCell>
      <TableCell>
        <StatusBadge status={request.status} />
      </TableCell>
      <TableCell onClick={(event) => event.stopPropagation()}>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {request.status === "pending" ? (
            <>
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-wide text-[#1B6EF3] hover:underline"
                onClick={onAccept}
              >
                Accept
              </button>
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-wide text-[#1B6EF3] hover:underline"
                onClick={onReject}
              >
                Reject
              </button>
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-wide text-[#1B6EF3] hover:underline"
                onClick={onCounter}
              >
                Counter
              </button>
            </>
          ) : null}
          {request.status === "accepted" ? (
            <>
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-wide text-[#1B6EF3] hover:underline"
                onClick={onViewOrder}
              >
                View Order
              </button>
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500 hover:underline"
                onClick={onHistory}
              >
                History
              </button>
            </>
          ) : null}
          {request.status === "rejected" ||
          request.status === "expired" ||
          request.status === "closed" ? (
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-wide text-[#1B6EF3] hover:underline"
              onClick={onHistory}
            >
              History
            </button>
          ) : null}
          {request.status === "counter_sent" ? (
            <>
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-wide text-[#1B6EF3] hover:underline"
                onClick={onViewCounter}
              >
                View Counter
              </button>
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500 hover:underline"
                onClick={onHistory}
              >
                History
              </button>
            </>
          ) : null}
        </div>
      </TableCell>
    </motion.tr>
  );
}
