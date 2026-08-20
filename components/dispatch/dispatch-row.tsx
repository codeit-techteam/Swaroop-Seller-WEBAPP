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
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2 py-1 text-sm font-semibold text-red-600">
        <Clock3 className="h-3.5 w-3.5" />
        {deadlineLabel ?? format(parseISO(deadline), "dd MMM, HH:mm")}
      </span>
    );
  }

  return (
    <span className="text-sm tabular-nums text-slate-600">
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
    label: "View",
    onClick: onView,
    className:
      "bg-slate-900 text-white hover:bg-slate-800 shadow-sm shadow-slate-900/10",
  };

  if (needsTruck) {
    primaryAction = {
      label: "Assign Truck",
      onClick: onAssignTruck,
      className:
        "bg-[#0B1F3A] text-white hover:bg-[#16345A] shadow-sm shadow-slate-900/10",
    };
  } else if (needsEway) {
    primaryAction = {
      label: "Generate E-Way",
      onClick: onGenerateEway,
      className:
        "bg-teal-600 text-white hover:bg-teal-700 shadow-sm shadow-teal-600/20",
    };
  } else if (canRelease) {
    primaryAction = {
      label: "Release",
      onClick: onRelease,
      className:
        "bg-teal-600 text-white hover:bg-teal-700 shadow-sm shadow-teal-600/20",
    };
  }

  return (
    <TableRow
      className={cn(
        "group relative cursor-pointer border-slate-100 transition-colors",
        active
          ? "bg-[#E8F1FF]/70 hover:bg-[#E8F1FF]/90"
          : "hover:bg-slate-50/80",
      )}
      onClick={onSelect}
    >
      <TableCell className="relative font-semibold text-slate-900">
        {active ? (
          <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-[#1B6EF3]" />
        ) : null}
        <span className="font-mono text-[13px] tracking-tight">
          {dispatch.orderNumber}
        </span>
      </TableCell>
      <TableCell className="max-w-[180px] truncate text-sm font-medium text-slate-700">
        {dispatch.buyerCompany}
      </TableCell>
      <TableCell>
        <MaterialBadge material={dispatch.material} />
      </TableCell>
      <TableCell className="text-sm font-semibold tabular-nums text-slate-800">
        {dispatch.quantityMt.toFixed(1)}{" "}
        <span className="font-medium text-slate-400">MT</span>
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
            "h-8 rounded-lg px-3 text-[11px] font-semibold tracking-wide opacity-90 transition-all group-hover:opacity-100",
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
