"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface StickyFooterProps {
  children: ReactNode;
  className?: string;
  left?: ReactNode;
}

export function StickyFooter({ children, className, left }: StickyFooterProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 -mx-4 border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
        className,
      )}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
        <div className="flex-shrink-0">{left}</div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {children}
        </div>
      </div>
    </div>
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
