"use client";

import { cn } from "@/lib/utils";
import type { ShipmentTab } from "@/types/shipments";
import { SHIPMENT_TABS } from "@/types/shipments";

interface ShipmentTabsProps {
  activeTab: ShipmentTab;
  counts: Record<ShipmentTab, number>;
  onChange: (tab: ShipmentTab) => void;
  className?: string;
}

export function ShipmentTabs({
  activeTab,
  counts,
  onChange,
  className,
}: ShipmentTabsProps) {
  return (
    <div
      className={cn(
        "flex gap-1 overflow-x-auto border-b border-slate-200",
        className,
      )}
    >
      {SHIPMENT_TABS.map((tab) => {
        const active = activeTab === tab.key;
        const count = counts[tab.key];

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative flex shrink-0 items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
              active ? "text-[#1B6EF3]" : "text-slate-500 hover:text-slate-800",
            )}
          >
            {tab.label}
            {count > 0 ? (
              <span
                className={cn(
                  "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  active
                    ? "bg-[#0B1F3A] text-white"
                    : "bg-slate-100 text-slate-600",
                )}
              >
                {count}
              </span>
            ) : null}
            {active ? (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#1B6EF3]" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
