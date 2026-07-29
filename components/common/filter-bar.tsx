"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-soft",
        className,
      )}
    >
      {children}
    </div>
  );
}
