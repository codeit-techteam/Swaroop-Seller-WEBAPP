"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

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
  href?: string;
  icon?: ComponentType<{ className?: string }>;
  hint?: string;
  accent?: "default" | "blue" | "amber" | "emerald" | "rose";
}

const accentStyles = {
  default: {
    icon: "bg-slate-100 text-slate-600",
    hover: "hover:border-slate-300",
  },
  blue: {
    icon: "bg-[#1B6EF3]/10 text-[#1B6EF3]",
    hover: "hover:border-[#1B6EF3]/40",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600",
    hover: "hover:border-amber-300",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600",
    hover: "hover:border-emerald-300",
  },
  rose: {
    icon: "bg-rose-50 text-rose-600",
    hover: "hover:border-rose-300",
  },
};

export function SummaryCard({
  title,
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  valueClassName,
  className,
  href,
  icon: Icon,
  hint,
  accent = "default",
}: SummaryCardProps) {
  const tones = accentStyles[accent];

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={href ? { y: -2 } : undefined}
      transition={{ duration: 0.25 }}
      className={cn(
        "h-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm",
        href &&
          cn("cursor-pointer transition-colors hover:shadow-md", tones.hover),
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          {title}
        </p>
        {Icon ? (
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              tones.icon,
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
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
      {hint || href ? (
        <div className="mt-1.5 flex items-center justify-between gap-2">
          {hint ? <p className="text-xs text-slate-400">{hint}</p> : <span />}
          {href ? (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#1B6EF3]">
              View
              <ChevronRight className="h-3 w-3" />
            </span>
          ) : null}
        </div>
      ) : null}
    </motion.div>
  );

  if (!href) return card;

  return (
    <Link
      href={href}
      className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B6EF3] focus-visible:ring-offset-2"
      aria-label={`Open ${title}`}
    >
      {card}
    </Link>
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
