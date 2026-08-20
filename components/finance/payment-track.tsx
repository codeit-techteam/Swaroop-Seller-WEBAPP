"use client";

import { motion } from "framer-motion";
import { Check, Circle, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { getTrackProgress } from "@/lib/utils/payment-track";
import type { PaymentTrackStep } from "@/types/finance";

interface PaymentTrackInlineProps {
  track: PaymentTrackStep[];
  className?: string;
}

/** Compact horizontal stepper for table rows. */
export function PaymentTrackInline({
  track,
  className,
}: PaymentTrackInlineProps) {
  const progress = getTrackProgress(track);

  return (
    <div className={cn("min-w-[168px] space-y-1.5", className)}>
      <div className="flex items-center gap-1">
        {track.map((step, index) => {
          const isLast = index === track.length - 1;
          const done = step.status === "completed";
          const current = step.status === "current" || step.status === "failed";
          const failed = step.status === "failed";

          return (
            <div key={step.key} className="flex flex-1 items-center">
              <span
                title={step.label}
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                  done && "border-emerald-500 bg-emerald-500 text-white",
                  current &&
                    !failed &&
                    "border-[#1B6EF3] bg-[#E8F1FF] text-[#1B6EF3]",
                  failed && "border-red-500 bg-red-500 text-white",
                  step.status === "upcoming" &&
                    "border-slate-200 bg-white text-slate-300",
                )}
              >
                {done || failed ? (
                  failed ? (
                    <X className="h-2.5 w-2.5" />
                  ) : (
                    <Check className="h-2.5 w-2.5" />
                  )
                ) : (
                  <Circle className="h-1.5 w-1.5 fill-current" />
                )}
              </span>
              {!isLast ? (
                <span
                  className={cn(
                    "mx-0.5 h-0.5 flex-1 rounded-full",
                    done ? "bg-emerald-400" : "bg-slate-200",
                  )}
                />
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="truncate text-[11px] text-slate-500">
        <span className="font-medium text-slate-700">
          {progress.currentLabel}
        </span>
        <span className="text-slate-400">
          {" "}
          · {progress.completed}/{progress.total}
        </span>
      </p>
    </div>
  );
}

interface PaymentTrackTimelineProps {
  track: PaymentTrackStep[];
  className?: string;
}

/** Full vertical timeline for the payment drawer. */
export function PaymentTrackTimeline({
  track,
  className,
}: PaymentTrackTimelineProps) {
  const progress = getTrackProgress(track);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600">Payment progress</span>
          <span className="tabular-nums font-semibold text-slate-800">
            {progress.percent}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <motion.div
            className="h-full rounded-full bg-[#1B6EF3]"
            initial={{ width: 0 }}
            animate={{ width: `${progress.percent}%` }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
        </div>
      </div>

      <ol className="relative space-y-0">
        {track.map((step, index) => {
          const isLast = index === track.length - 1;
          const isCompleted = step.status === "completed";
          const isCurrent = step.status === "current";
          const isFailed = step.status === "failed";

          return (
            <motion.li
              key={step.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative flex gap-3 pb-5 last:pb-0"
            >
              {!isLast ? (
                <span
                  className={cn(
                    "absolute left-[11px] top-6 h-[calc(100%-12px)] w-px",
                    isCompleted ? "bg-emerald-300" : "bg-slate-200",
                  )}
                />
              ) : null}

              <span
                className={cn(
                  "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                  isCompleted && "border-emerald-500 bg-emerald-500 text-white",
                  isCurrent && "border-[#1B6EF3] bg-[#E8F1FF] text-[#1B6EF3]",
                  isFailed && "border-red-500 bg-red-500 text-white",
                  step.status === "upcoming" &&
                    "border-slate-200 bg-white text-slate-300",
                )}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3" />
                ) : isFailed ? (
                  <X className="h-3 w-3" />
                ) : (
                  <Circle className="h-2 w-2 fill-current" />
                )}
              </span>

              <div
                className={cn(
                  "min-w-0 flex-1 rounded-lg px-3 py-2",
                  (isCurrent || isFailed) &&
                    "border border-[#1B6EF3]/25 bg-[#E8F1FF]/40",
                  isFailed && "border-red-200 bg-red-50/60",
                )}
              >
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCompleted || isCurrent || isFailed
                      ? "text-slate-800"
                      : "text-slate-400",
                  )}
                >
                  {step.label}
                </p>
                {step.description ? (
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {step.description}
                  </p>
                ) : null}
                {step.at ? (
                  <p className="mt-0.5 text-[11px] tabular-nums text-slate-400">
                    {step.at}
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
