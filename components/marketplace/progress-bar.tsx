"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  className,
  showLabel = true,
}: ProgressBarProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full bg-[#1B6EF3]"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      {showLabel ? (
        <p className="text-xs text-slate-500">{Math.round(value)}% uploaded</p>
      ) : null}
    </div>
  );
}
