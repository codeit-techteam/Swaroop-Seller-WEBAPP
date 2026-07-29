"use client";

import { motion } from "framer-motion";
import { Check, Truck } from "lucide-react";

import { cn } from "@/lib/utils";
import type { BookingTimelineStep } from "@/types/slot-booking";

interface BookingTimelineProps {
  steps: BookingTimelineStep[];
  className?: string;
}

export function BookingTimeline({ steps, className }: BookingTimelineProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Booking Progress
      </p>
      <div className="overflow-x-auto pb-2">
        <ol className="flex min-w-[720px] items-start">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const completed = step.status === "completed";
            const current = step.status === "current";
            return (
              <li
                key={step.key}
                className="relative flex flex-1 flex-col items-center"
              >
                {!isLast ? (
                  <span
                    className={cn(
                      "absolute left-1/2 top-4 h-0.5 w-full",
                      completed || current ? "bg-[#1B6EF3]" : "bg-slate-200",
                    )}
                  />
                ) : null}
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2",
                    completed
                      ? "border-[#1B6EF3] bg-[#1B6EF3] text-white"
                      : current
                        ? "border-[#1B6EF3] bg-white text-[#1B6EF3]"
                        : "border-slate-200 bg-white text-slate-300",
                  )}
                >
                  {completed ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : current ? (
                    <Truck className="h-4 w-4" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                  )}
                </motion.span>
                <p
                  className={cn(
                    "mt-2 max-w-[90px] text-center text-[10px] font-semibold leading-tight",
                    current
                      ? "text-[#1B6EF3]"
                      : completed
                        ? "text-slate-700"
                        : "text-slate-400",
                  )}
                >
                  {step.label}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
