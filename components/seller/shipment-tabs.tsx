"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ShipmentTab } from "@/types/seller";

const TABS: { id: ShipmentTab; label: string }[] = [
  { id: "IN_TRANSIT", label: "In Transit" },
  { id: "DELIVERED", label: "Delivered" },
];

interface ShipmentStatusTabsProps {
  value: ShipmentTab;
  onChange: (tab: ShipmentTab) => void;
}

export function ShipmentStatusTabs({
  value,
  onChange,
}: ShipmentStatusTabsProps) {
  return (
    <div className="flex gap-2" role="tablist" aria-label="Shipment status">
      {TABS.map((tab) => {
        const selected = value === tab.id;
        return (
          <Button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            size="sm"
            onClick={() => onChange(tab.id)}
            className={cn(
              "min-w-[108px] rounded-md",
              selected
                ? "bg-[#1B6EF3] text-white hover:bg-[#1558c7]"
                : "border border-slate-200 bg-white text-slate-700 shadow-none hover:bg-slate-50",
            )}
          >
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}
