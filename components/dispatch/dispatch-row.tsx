"use client";

import { format, parseISO } from "date-fns";
import { Clock3 } from "lucide-react";

import { MaterialBadge, StatusBadge } from "@/components/dispatch/status-badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { DispatchOrder } from "@/types/dispatch";

function DeadlineCell({
  deadline,
  deadlineLabel,
  isDelayed,
}: {
  deadline: string;
  deadlineLabel?: string;
  isDelayed: boolean;
}) {
  if (deadlineLabel || isDelayed) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600">
        <Clock3 className="h-3.5 w-3.5" />
        {deadlineLabel ?? format(parseISO(deadline), "dd MMM, HH:mm")}
      </span>
    );
  }

  return (
    <span className="text-sm text-slate-600">
      {format(parseISO(deadline), "dd MMM, HH:mm")}
    </span>
  );
}

interface DispatchRowProps {
  dispatch: DispatchOrder;
  active?: boolean;
  onSelect: () => void;
  onAssignTruck: () => void;
  onGenerateEway: () => void;
  onRelease: () => void;
  onView: () => void;
}

export function DispatchRow({
  dispatch,
  active,
  onSelect,
  onAssignTruck,
  onGenerateEway,
  onRelease,
  onView,
}: DispatchRowProps) {
  const needsTruck =
    dispatch.status === "ready_to_dispatch" || !dispatch.transport;
  const needsEway =
    !dispatch.ewayBillNumber &&
    dispatch.checklist.some(
      (c) => c.key === "ewayGenerated" && c.status !== "completed",
    );
  const canRelease =
    dispatch.status === "ready_for_release" ||
    dispatch.status === "loading_in_progress";

  let primaryAction: {
    label: string;
    onClick: () => void;
    className: string;
  } = {
    label: "VIEW DISPATCH",
    onClick: onView,
    className: "bg-[#0B1F3A] hover:bg-[#16345A]",
  };

  if (needsTruck) {
    primaryAction = {
      label: "ASSIGN TRUCK",
      onClick: onAssignTruck,
      className: "bg-[#0B1F3A] hover:bg-[#16345A]",
    };
  } else if (needsEway) {
    primaryAction = {
      label: "GENERATE E-WAY",
      onClick: onGenerateEway,
      className: "bg-teal-600 hover:bg-teal-700",
    };
  } else if (canRelease) {
    primaryAction = {
      label: "RELEASE SHIPMENT",
      onClick: onRelease,
      className: "bg-teal-600 hover:bg-teal-700",
    };
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
        {dispatch.orderNumber}
      </TableCell>
      <TableCell className="max-w-[180px] truncate text-sm text-slate-700">
        {dispatch.buyerCompany}
      </TableCell>
      <TableCell>
        <MaterialBadge material={dispatch.material} />
      </TableCell>
      <TableCell className="text-sm font-medium text-slate-700">
        {dispatch.quantityMt.toFixed(1)} MT
      </TableCell>
      <TableCell className="max-w-[160px] truncate text-sm text-slate-600">
        {dispatch.destination}
      </TableCell>
      <TableCell>
        <DeadlineCell
          deadline={dispatch.deadline}
          deadlineLabel={dispatch.deadlineLabel}
          isDelayed={dispatch.isDelayed}
        />
      </TableCell>
      <TableCell>
        <StatusBadge status={dispatch.status} isDelayed={dispatch.isDelayed} />
      </TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <Button
          size="sm"
          className={cn(
            "h-8 px-3 text-[11px] font-bold uppercase",
            primaryAction.className,
          )}
          onClick={primaryAction.onClick}
        >
          {primaryAction.label}
        </Button>
      </TableCell>
    </TableRow>
  );
}
