"use client";

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
        "flex gap-1 overflow-x-auto border-b border-slate-200",
        className,
      )}
    >
      {DISPATCH_TABS.map((tab) => {
        const active = activeTab === tab.key;
        const count = counts[tab.key];
        const showCount =
          tab.key !== "dispatched" && tab.key !== "delivered"
            ? ` (${count})`
            : count > 0
              ? ` (${count})`
              : "";

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative shrink-0 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
              active ? "text-[#1B6EF3]" : "text-slate-500 hover:text-slate-800",
            )}
          >
            {tab.label}
            {showCount}
            {active ? (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#1B6EF3]" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
