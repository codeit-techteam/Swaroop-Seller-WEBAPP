"use client";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";
import type { PriceRevisionRequest } from "@/types/price-revision";

import { DeadlineTimer } from "./deadline-timer";
import { StatusBadge } from "./status-badge";

interface PriceRevisionRowProps {
  request: PriceRevisionRequest;
  active?: boolean;
  onSelect: () => void;
  onReview: () => void;
  onViewStatus: () => void;
  onDetails: () => void;
  onHistory: () => void;
}

function formatPrice(value: number): string {
  return `${formatCurrency(value, { currency: "INR" }).replace(/\.00$/, "")}/MT`;
}

function getActionConfig(status: PriceRevisionRequest["status"]) {
  switch (status) {
    case "pending_response":
      return {
        primary: { label: "Review Request", variant: "primary" as const },
        secondary: null,
      };
    case "countered":
      return {
        primary: { label: "View Status", variant: "outline" as const },
        secondary: { label: "Details", variant: "outline" as const },
      };
    case "accepted":
    case "completed":
      return {
        primary: { label: "Details", variant: "outline" as const },
        secondary: { label: "History", variant: "outline" as const },
      };
    case "expired":
    case "rejected":
      return {
        primary: { label: "View History", variant: "outline" as const },
        secondary: null,
      };
    default:
      return {
        primary: { label: "Details", variant: "outline" as const },
        secondary: null,
      };
  }
}

export function PriceRevisionRow({
  request,
  active,
  onSelect,
  onReview,
  onViewStatus,
  onDetails,
  onHistory,
}: PriceRevisionRowProps) {
  const actions = getActionConfig(request.status);

  const handlePrimary = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (request.status === "pending_response") onReview();
    else if (request.status === "countered") onViewStatus();
    else if (request.status === "accepted" || request.status === "completed")
      onDetails();
    else onHistory();
  };

  const handleSecondary = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (request.status === "countered") onDetails();
    else onHistory();
  };

  return (
    <TableRow
      className={cn(
        "cursor-pointer transition-colors",
        active ? "bg-[#E8F1FF]/60" : "hover:bg-slate-50/80",
      )}
      onClick={onSelect}
    >
      <TableCell className="font-semibold text-[#1B6EF3]">
        #{request.requestId}
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium text-slate-800">{request.productName}</p>
          <p className="text-xs text-slate-500">Batch: {request.batchNumber}</p>
        </div>
      </TableCell>
      <TableCell className="tabular-nums text-slate-700">
        {formatPrice(request.currentPrice)}
      </TableCell>
      <TableCell className="font-medium tabular-nums text-[#1B6EF3]">
        {formatPrice(request.suggestedPrice)}
      </TableCell>
      <TableCell className="max-w-[160px] text-sm text-slate-600">
        {request.reason}
      </TableCell>
      <TableCell>
        <DeadlineTimer deadline={request.deadline} status={request.status} />
      </TableCell>
      <TableCell>
        <StatusBadge status={request.status} animated />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            className={cn(
              "h-8 text-[10px] font-bold uppercase tracking-wide",
              actions.primary.variant === "primary"
                ? "bg-[#0B1F3A] hover:bg-[#122846]"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
            )}
            variant={
              actions.primary.variant === "primary" ? "default" : "outline"
            }
            onClick={handlePrimary}
          >
            {actions.primary.label}
          </Button>
          {actions.secondary ? (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-[10px] font-bold uppercase tracking-wide"
              onClick={handleSecondary}
            >
              {actions.secondary.label}
            </Button>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
}
