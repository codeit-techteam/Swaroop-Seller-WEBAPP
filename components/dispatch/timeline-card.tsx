"use client";

import { format, parseISO } from "date-fns";

import { cn } from "@/lib/utils";
import type { DispatchActivity } from "@/types/dispatch";

interface TimelineCardProps {
  activities: DispatchActivity[];
  className?: string;
}

export function TimelineCard({ activities, className }: TimelineCardProps) {
  const items = activities.slice(0, 6);

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Recent Activity
      </h4>
      <ol className="relative space-y-0 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isSuccess = item.status === "success" || index === 0;
          return (
            <li key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
              {!isLast ? (
                <span className="absolute left-[5px] top-3 h-[calc(100%-4px)] w-px bg-slate-200" />
              ) : null}
              <span
                className={cn(
                  "relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-white",
                  isSuccess ? "bg-emerald-500" : "bg-slate-300",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800">
                  {item.title}
                </p>
                {item.description ? (
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                ) : null}
                <p className="mt-1 text-[11px] tabular-nums text-slate-400">
                  {format(parseISO(item.timestamp), "'Today' hh:mm a")}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
