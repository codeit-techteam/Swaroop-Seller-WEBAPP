"use client";

import { motion } from "framer-motion";
import { Check, Circle, Hourglass } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TimelineStep } from "@/types/orders";

interface TimelineProps {
  steps: TimelineStep[];
  className?: string;
  title?: string;
}

export function Timeline({
  steps,
  className,
  title = "Order Timeline",
}: TimelineProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {title ? (
        <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {title}
        </h4>
      ) : null}
      <ol className="relative space-y-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const completed = step.status === "completed";
          const current = step.status === "current";

          return (
            <motion.li
              key={step.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, duration: 0.25 }}
              className="relative flex gap-3 pb-5 last:pb-0"
            >
              {!isLast ? (
                <span
                  className={cn(
                    "absolute left-[11px] top-6 h-[calc(100%-8px)] w-0.5",
                    completed ? "bg-[#1B6EF3]" : "bg-slate-200",
                  )}
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                  completed && "border-emerald-500 bg-emerald-500 text-white",
                  current && "border-[#0B1F3A] bg-[#0B1F3A] text-white",
                  !completed &&
                    !current &&
                    "border-slate-300 bg-white text-slate-300",
                )}
              >
                {completed ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : current ? (
                  <Hourglass className="h-3 w-3" />
                ) : (
                  <Circle className="h-2.5 w-2.5 fill-current" />
                )}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    current || completed ? "text-slate-900" : "text-slate-500",
                  )}
                >
                  {step.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {step.description}
                </p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
