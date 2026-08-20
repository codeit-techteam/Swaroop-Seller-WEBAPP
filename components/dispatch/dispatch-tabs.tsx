"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { DispatchTab } from "@/types/dispatch";
import { DISPATCH_TABS } from "@/types/dispatch";

interface DispatchTabsProps {
  activeTab: DispatchTab;
  counts: Record<DispatchTab, number>;
  onChange: (tab: DispatchTab) => void;
  className?: string;
}

export function DispatchTabs({
  activeTab,
  counts,
  onChange,
  className,
}: DispatchTabsProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm",
        className,
      )}
    >
      <div className="flex gap-1 overflow-x-auto scrollbar-none">
        {DISPATCH_TABS.map((tab) => {
          const active = activeTab === tab.key;
          const count = counts[tab.key];
          const showCount =
            tab.key !== "dispatched" && tab.key !== "delivered"
              ? true
              : count > 0;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={cn(
                "relative shrink-0 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "text-[#1B6EF3]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="dispatch-tab-pill"
                  className="absolute inset-0 rounded-xl bg-[#E8F1FF]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : null}
              <span className="relative z-10 inline-flex items-center gap-2">
                {tab.label}
                {showCount ? (
                  <span
                    className={cn(
                      "inline-flex min-w-[1.35rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
                      active
                        ? "bg-[#1B6EF3] text-white"
                        : "bg-slate-100 text-slate-600",
                    )}
                  >
                    {count}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
