"use client";

import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

import { cn } from "@/lib/utils";

interface DeadlineCardProps {
  deadline: string;
  timeSlot: string;
  className?: string;
}

export function DeadlineCard({
  deadline,
  timeSlot,
  className,
}: DeadlineCardProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3",
        className,
      )}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
        <CalendarDays className="h-4 w-4" />
      </span>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Dispatch Deadline
        </p>
        <p className="mt-0.5 text-sm font-semibold text-slate-800">
          {format(new Date(deadline), "MMM dd, yyyy")}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">{timeSlot}</p>
      </div>
    </div>
  );
}
