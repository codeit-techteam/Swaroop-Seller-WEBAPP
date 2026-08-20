"use client";

import { motion } from "framer-motion";
import { Check, Circle, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DispatchChecklistItem } from "@/types/dispatch";

interface ChecklistCardProps {
  items: DispatchChecklistItem[];
  className?: string;
}

export function ChecklistCard({ items, className }: ChecklistCardProps) {
  const completed = items.filter((i) => i.status === "completed").length;
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Operational Checklist
          </h4>
          <p className="mt-1 text-xs text-slate-500">
            {completed} of {items.length} steps complete
          </p>
        </div>
        <span className="text-sm font-bold tabular-nums text-teal-600">
          {progress}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <ul className="relative space-y-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.key} className="relative flex gap-3 pb-3 last:pb-0">
              {!isLast ? (
                <span
                  className={cn(
                    "absolute left-[9px] top-5 h-[calc(100%-8px)] w-px",
                    item.status === "completed"
                      ? "bg-emerald-200"
                      : "bg-slate-200",
                  )}
                />
              ) : null}

              {item.status === "completed" ? (
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </motion.span>
              ) : item.status === "in_progress" ? (
                <span className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 ring-2 ring-teal-200">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" />
                </span>
              ) : (
                <Circle
                  className="relative z-10 h-5 w-5 shrink-0 text-slate-300"
                  strokeWidth={1.5}
                />
              )}

              <span
                className={cn(
                  "pt-0.5 text-sm font-medium leading-tight",
                  item.status === "completed"
                    ? "text-slate-800"
                    : item.status === "in_progress"
                      ? "text-teal-700"
                      : "text-slate-400",
                )}
              >
                {item.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
