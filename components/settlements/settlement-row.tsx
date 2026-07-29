"use client";

import { format, parseISO } from "date-fns";
import { ChevronRight } from "lucide-react";

import { StatusBadge } from "@/components/settlements/status-badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";
import type { Settlement } from "@/types/settlements";

interface SettlementRowProps {
  settlement: Settlement;
  active?: boolean;
  onSelect: () => void;
}

export function SettlementRow({
  settlement,
  active,
  onSelect,
}: SettlementRowProps) {
  const paymentDisplay = settlement.paymentDate
    ? format(parseISO(settlement.paymentDate), "MMM dd, yyyy")
    : settlement.estimatedPaymentDate
      ? `Est. ${format(parseISO(settlement.estimatedPaymentDate), "MMM dd")}`
      : "—";

  return (
    <TableRow
      className={cn(
        "cursor-pointer transition-colors",
        active ? "bg-[#E8F1FF]/60" : "hover:bg-slate-50/80",
      )}
      onClick={onSelect}
    >
      <TableCell className="font-semibold text-[#1B6EF3]">
        {settlement.settlementId}
      </TableCell>
      <TableCell className="text-slate-700">{settlement.orderRef}</TableCell>
      <TableCell className="max-w-[180px] truncate text-slate-700">
        {settlement.product}
      </TableCell>
      <TableCell className="tabular-nums text-slate-700">
        {settlement.quantityMt.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </TableCell>
      <TableCell className="tabular-nums text-slate-700">
        {formatCurrency(settlement.invoiceAmount, { currency: "INR" }).replace(
          /\.00$/,
          "",
        )}
      </TableCell>
      <TableCell className="font-medium tabular-nums text-slate-900">
        {formatCurrency(settlement.netSettlement, { currency: "INR" }).replace(
          /\.00$/,
          "",
        )}
      </TableCell>
      <TableCell className="text-slate-600">{paymentDisplay}</TableCell>
      <TableCell>
        <StatusBadge status={settlement.status} />
      </TableCell>
      <TableCell className="text-right">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="inline-flex items-center gap-0.5 text-xs font-medium text-[#1B6EF3] hover:underline"
        >
          View
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </TableCell>
    </TableRow>
  );
}
