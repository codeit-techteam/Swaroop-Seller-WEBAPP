"use client";

import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SettlementTimelineStep } from "@/types/settlements";

interface SettlementTimelineProps {
  steps: SettlementTimelineStep[];
  className?: string;
}

export function SettlementTimeline({
  steps,
  className,
}: SettlementTimelineProps) {
  if (steps.length === 0) {
    return (
      <div className={cn("space-y-3", className)}>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Settlement Timeline
        </h4>
        <p className="text-sm text-slate-500">No timeline events yet.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Settlement Timeline
      </h4>
      <ol className="relative space-y-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isCompleted = step.status === "completed";
          const isCurrent = step.status === "current";

          return (
            <motion.li
              key={step.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative flex gap-3 pb-5"
            >
              {!isLast ? (
                <motion.span
                  className={cn(
                    "absolute left-[11px] top-6 h-[calc(100%-12px)] w-px",
                    isCompleted ? "bg-emerald-300" : "bg-slate-200",
                  )}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: index * 0.05 + 0.1, duration: 0.3 }}
                  style={{ transformOrigin: "top" }}
                />
              ) : null}

              <span
                className={cn(
                  "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                  isCompleted
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : isCurrent
                      ? "border-[#1B6EF3] bg-[#E8F1FF] text-[#1B6EF3] ring-2 ring-[#1B6EF3]/20"
                      : "border-slate-200 bg-white text-slate-300",
                )}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Circle className="h-2 w-2 fill-current" />
                )}
              </span>

              <div
                className={cn(
                  "min-w-0 flex-1 rounded-lg px-3 py-2",
                  isCurrent && "border border-[#1B6EF3]/30 bg-[#E8F1FF]/50",
                )}
              >
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCompleted || isCurrent
                      ? "text-slate-800"
                      : "text-slate-400",
                  )}
                >
                  {step.label}
                </p>
                {step.timestamp ? (
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {format(parseISO(step.timestamp), "MMM dd, yyyy")}
                  </p>
                ) : null}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
