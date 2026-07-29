"use client";

import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { AlertTriangle, Check, Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TimelineStep } from "@/types/price-revision";

interface AuditTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

function formatStepTime(timestamp?: string) {
  if (!timestamp) return "";
  return format(parseISO(timestamp), "MMM d, yyyy · h:mm a");
}

function StepIcon({ status }: { status: TimelineStep["status"] }) {
  if (status === "completed") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    );
  }
  if (status === "current") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white">
        <Circle className="h-2 w-2 fill-white" />
      </span>
    );
  }
  if (status === "danger") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white">
        <AlertTriangle className="h-3 w-3" strokeWidth={2.5} />
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-200 bg-white">
      <Circle className="h-2 w-2 text-slate-300" />
    </span>
  );
}

export function AuditTimeline({ steps, className }: AuditTimelineProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Audit Timeline
      </h4>
      <ol className="relative space-y-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isCurrent =
            step.status === "current" || step.status === "danger";

          return (
            <motion.li
              key={step.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, duration: 0.25 }}
              className="relative flex gap-3 pb-5"
            >
              {!isLast ? (
                <span className="absolute left-[9px] top-5 h-[calc(100%-4px)] w-px bg-slate-200" />
              ) : null}
              <div className="relative z-10 mt-0.5 shrink-0">
                <StepIcon status={step.status} />
              </div>
              <div className="min-w-0 flex-1 pt-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isCurrent
                          ? "text-orange-700"
                          : step.status === "danger"
                            ? "text-red-700"
                            : step.status === "completed"
                              ? "text-slate-800"
                              : "text-slate-500",
                      )}
                    >
                      {step.title}
                    </p>
                    {step.description ? (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {step.description}
                      </p>
                    ) : null}
                    {step.actor ? (
                      <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                        {step.actor}
                      </p>
                    ) : null}
                  </div>
                  {step.timestamp ? (
                    <span className="shrink-0 text-[10px] text-slate-400">
                      {formatStepTime(step.timestamp)}
                    </span>
                  ) : null}
                </div>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
