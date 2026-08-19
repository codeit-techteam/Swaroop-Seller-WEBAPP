"use client";

import type { ReactNode } from "react";

import { SummaryCard } from "@/components/erp";
import { cn } from "@/lib/utils";

export interface OpsKpi {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  valueClassName?: string;
}

interface OperationsShellProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  kpis?: OpsKpi[];
  children: ReactNode;
  className?: string;
}

export function OperationsShell({
  title,
  subtitle,
  actions,
  kpis,
  children,
  className,
}: OperationsShellProps) {
  return (
    <div className={cn("mx-auto max-w-[1400px] space-y-5 px-4 py-5 md:px-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {kpis?.length ? (
        <div
          className={cn(
            "grid gap-3 sm:grid-cols-2",
            kpis.length >= 5 ? "lg:grid-cols-5 xl:grid-cols-6" : "lg:grid-cols-4",
          )}
        >
          {kpis.map((kpi) => (
            <SummaryCard key={kpi.title} {...kpi} />
          ))}
        </div>
      ) : null}
      {children}
    </div>
  );
}
