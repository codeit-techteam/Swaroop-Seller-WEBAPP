"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface StickyFooterProps {
  children: ReactNode;
  className?: string;
  left?: ReactNode;
  /**
   * When true, footer is reserved in document flow at the end of the column
   * (no mid-form overlay). Prefer this inside long forms.
   */
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
          "mt-8 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm sm:px-5",
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
