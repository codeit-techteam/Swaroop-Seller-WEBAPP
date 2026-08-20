"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface StickyFooterProps {
  children: ReactNode;
  className?: string;
  left?: ReactNode;
  /** When true, footer stays within the parent column instead of spanning the viewport */
  contained?: boolean;
}

export function StickyFooter({
  children,
  className,
  left,
  contained = false,
}: StickyFooterProps) {
  if (contained) {
    return (
      <div
        className={cn(
          "sticky bottom-0 z-20 -mx-4 mt-6 border-t border-slate-200 bg-[#F4F7F9]/95 px-4 py-3.5 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] backdrop-blur-md sm:-mx-6 sm:px-6 sm:py-4",
          className,
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 shrink-0">{left}</div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-2.5">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-20 shrink-0" aria-hidden="true" />
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md sm:py-4 md:px-6 lg:left-[260px]",
          className,
        )}
      >
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 shrink-0">{left}</div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-2.5">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

interface ActionToolbarProps {
  children: ReactNode;
  className?: string;
}

export function ActionToolbar({ children, className }: ActionToolbarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  );
}
