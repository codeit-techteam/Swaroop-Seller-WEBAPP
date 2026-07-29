"use client";

import { cn } from "@/lib/utils";
import type { StockMovement } from "@/types/inventory";

interface TimelineProps {
  items: Array<{
    id: string;
    title: string;
    description?: string;
    time: string;
    status?:
      | "completed"
      | "current"
      | "pending"
      | "info"
      | "success"
      | "warning"
      | "danger";
  }>;
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cn("relative space-y-5", className)}>
      {items.map((item, index) => {
        const isCurrent =
          item.status === "current" || item.status === "info" || index === 0;
        const isLast = index === items.length - 1;

        return (
          <li key={item.id} className="relative flex gap-3">
            {!isLast ? (
              <span className="absolute left-[7px] top-4 h-[calc(100%+8px)] w-px bg-slate-200" />
            ) : null}
            <span
              className={cn(
                "relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2",
                isCurrent
                  ? "border-[#1B6EF3] bg-[#1B6EF3]"
                  : "border-slate-300 bg-white",
              )}
            />
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-800">
                  {item.title}
                </p>
                <span className="shrink-0 text-[11px] font-medium text-slate-400">
                  {item.time}
                </span>
              </div>
              {item.description ? (
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {item.description}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

interface StockMovementTimelineProps {
  movements: StockMovement[];
  className?: string;
}

export function StockMovementTimeline({
  movements,
  className,
}: StockMovementTimelineProps) {
  return (
    <Timeline
      className={className}
      items={movements.map((movement) => ({
        id: movement.id,
        title: movement.title,
        description: movement.reference
          ? `${movement.description} • ${movement.reference}`
          : movement.description,
        time: new Date(movement.timestamp).toLocaleString("en-IN", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: movement.status,
      }))}
    />
  );
}
