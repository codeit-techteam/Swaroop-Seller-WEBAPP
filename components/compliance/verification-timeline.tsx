"use client";

import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { ComplianceTimelineStep } from "@/types/compliance";

interface VerificationTimelineProps {
  steps: ComplianceTimelineStep[];
  className?: string;
}

function formatStepTime(timestamp?: string, fallback?: string) {
  if (!timestamp) return fallback ?? "";
  return format(parseISO(timestamp), "MMM d, yyyy - HH:mm").toUpperCase();
}

function dotClass(status: ComplianceTimelineStep["status"]) {
  switch (status) {
    case "completed":
      return "border-emerald-500 bg-emerald-500";
    case "current":
      return "border-[#1B6EF3] bg-[#1B6EF3] ring-4 ring-[#1B6EF3]/15";
    case "warning":
      return "border-orange-500 bg-orange-500";
    case "danger":
      return "border-red-500 bg-red-500";
    default:
      return "border-slate-300 bg-white";
  }
}

export function VerificationTimeline({
  steps,
  className,
}: VerificationTimelineProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Verification Timeline
      </h4>
      <ol className="relative space-y-5">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <motion.li
              key={step.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, duration: 0.25 }}
              className="relative flex gap-3"
            >
              {!isLast ? (
                <span className="absolute left-[7px] top-4 h-[calc(100%+8px)] w-px bg-slate-200" />
              ) : null}
              <span
                className={cn(
                  "relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2",
                  dotClass(step.status),
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      step.status === "warning"
                        ? "text-orange-700"
                        : step.status === "danger"
                          ? "text-red-700"
                          : "text-slate-800",
                    )}
                  >
                    {step.title}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 text-[10px] font-semibold uppercase tracking-wide",
                      step.status === "warning"
                        ? "text-orange-600"
                        : step.status === "danger"
                          ? "text-red-600"
                          : "text-slate-400",
                    )}
                  >
                    {step.description
                      ? step.description
                      : formatStepTime(step.timestamp)}
                  </span>
                </div>
                {step.description && step.timestamp ? (
                  <p className="mt-1 text-[11px] text-slate-400">
                    {formatStepTime(step.timestamp)}
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
