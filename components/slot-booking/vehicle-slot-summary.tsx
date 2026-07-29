"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CalendarCheck2, Clock3, Truck } from "lucide-react";

import { AnimatedNumber } from "@/components/erp/animated-number";
import { cn } from "@/lib/utils";
import type { SlotBookingSummary } from "@/types/slot-booking";

const cards: {
  key: keyof SlotBookingSummary;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  valueClassName?: string;
  suffix?: string;
  pad?: boolean;
}[] = [
  {
    key: "todaysBookedSlots",
    label: "Today's Booked Slots",
    icon: CalendarCheck2,
    iconClassName: "bg-blue-50 text-[#1B6EF3]",
  },
  {
    key: "availableVehicles",
    label: "Available Vehicles",
    icon: Truck,
    iconClassName: "bg-slate-100 text-slate-700",
  },
  {
    key: "upcomingDispatches",
    label: "Upcoming Dispatches",
    icon: Clock3,
    iconClassName: "bg-violet-50 text-violet-600",
    pad: true,
  },
  {
    key: "lateArrivals",
    label: "Late Arrivals",
    icon: AlertTriangle,
    iconClassName: "bg-red-50 text-red-600",
    valueClassName: "text-red-600",
    pad: true,
  },
  {
    key: "avgLoadingTimeMinutes",
    label: "Avg. Loading Time",
    icon: Clock3,
    iconClassName: "bg-teal-50 text-teal-600",
    suffix: " m",
  },
];

interface VehicleSlotSummaryProps {
  summary: SlotBookingSummary;
  className?: string;
}

export function VehicleSlotSummary({
  summary,
  className,
}: VehicleSlotSummaryProps) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
        className,
      )}
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        const value = summary[card.key];
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ y: -2 }}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>
                <p
                  className={cn(
                    "mt-2 text-2xl font-bold tabular-nums text-slate-900",
                    card.valueClassName,
                  )}
                >
                  <AnimatedNumber
                    value={value}
                    decimals={0}
                    prefix={card.pad && value < 10 ? "0" : ""}
                    suffix={card.suffix ?? ""}
                  />
                </p>
              </div>
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  card.iconClassName,
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
