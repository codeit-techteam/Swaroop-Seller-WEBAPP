"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";

import { StatusBadge } from "@/components/purchase-requests/status-badge";
import { Button } from "@/components/ui/button";
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

function ActionButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "muted";
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 px-2.5 text-xs font-medium",
        variant === "primary"
          ? "text-[#1B6EF3] hover:bg-[#E8F1FF] hover:text-[#1558C8]"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
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
      <TableCell className="px-4 py-4 font-semibold text-[#1B6EF3]">
        {request.requestNumber}
      </TableCell>
      <TableCell className="px-4 py-4">
        <div>
          <p className="font-medium text-slate-800">{request.productName}</p>
          <p className="mt-0.5 text-xs text-slate-400">
            {request.productGrade}
          </p>
        </div>
      </TableCell>
      <TableCell className="px-4 py-4 tabular-nums font-medium text-slate-800">
        {formatNumber(request.quantityMt, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}{" "}
        MT
      </TableCell>
      <TableCell className="px-4 py-4 text-slate-600">
        {format(new Date(request.deadline), "dd MMM yyyy")}
      </TableCell>
      <TableCell className="px-4 py-4">
        <StatusBadge status={request.status} />
      </TableCell>
      <TableCell
        className="px-4 py-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-end gap-0.5">
          {request.status === "pending" ? (
            <>
              <ActionButton onClick={onAccept}>Accept</ActionButton>
              <ActionButton onClick={onReject}>Reject</ActionButton>
              <ActionButton onClick={onCounter}>Counter</ActionButton>
            </>
          ) : null}
          {request.status === "accepted" ? (
            <>
              <ActionButton onClick={onViewOrder}>View order</ActionButton>
              <ActionButton variant="muted" onClick={onHistory}>
                History
              </ActionButton>
            </>
          ) : null}
          {request.status === "rejected" ||
          request.status === "expired" ||
          request.status === "closed" ? (
            <ActionButton variant="muted" onClick={onHistory}>
              History
            </ActionButton>
          ) : null}
          {request.status === "counter_sent" ? (
            <>
              <ActionButton onClick={onViewCounter}>View counter</ActionButton>
              <ActionButton variant="muted" onClick={onHistory}>
                History
              </ActionButton>
            </>
          ) : null}
        </div>
      </TableCell>
    </motion.tr>
  );
}
