"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { AnimatedNumber } from "./animated-number";

interface SummaryCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  valueClassName?: string;
  className?: string;
}

export function SummaryCard({
  title,
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  valueClassName,
  className,
}: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        {title}
      </p>
      <p
        className={cn(
          "mt-2 text-2xl font-bold tracking-tight text-slate-900",
          valueClassName,
        )}
      >
        <AnimatedNumber
          value={value}
          decimals={decimals}
          prefix={prefix}
          suffix={suffix ? ` ${suffix}` : ""}
        />
      </p>
    </motion.div>
  );
}

interface MetricCardProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function MetricCard({ label, value, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2",
        className,
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-1 text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}
