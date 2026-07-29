"use client";

import { format } from "date-fns";
import { Calendar, ChevronDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { DateFilterPreset } from "@/types/performance";

const PRESETS: { id: DateFilterPreset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "last_7_days", label: "Last 7 Days" },
  { id: "last_30_days", label: "Last 30 Days" },
  { id: "this_quarter", label: "This Quarter" },
  { id: "custom", label: "Custom Range" },
];

interface DateFilterProps {
  preset: DateFilterPreset;
  dateFrom: string;
  dateTo: string;
  onPresetChange: (preset: DateFilterPreset) => void;
  onCustomRangeChange: (from: string, to: string) => void;
  className?: string;
}

export function DateFilter({
  preset,
  dateFrom,
  dateTo,
  onPresetChange,
  onCustomRangeChange,
  className,
}: DateFilterProps) {
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(dateFrom);
  const [customTo, setCustomTo] = useState(dateTo);

  const displayLabel = `${format(new Date(dateFrom), "MMM dd")} – ${format(new Date(dateTo), "MMM dd, yyyy")}`;

  const handleApplyCustom = () => {
    onCustomRangeChange(customFrom, customTo);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 gap-2 border-slate-200 bg-white px-3 text-sm font-medium text-slate-700",
            className,
          )}
        >
          <Calendar className="h-4 w-4 text-slate-400" />
          {displayLabel}
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="end">
        <div className="border-b border-slate-100 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Date Range
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PRESETS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onPresetChange(item.id);
                  if (item.id !== "custom") setOpen(false);
                }}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  preset === item.id
                    ? "bg-[#E8F1FF] text-[#1B6EF3]"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        {preset === "custom" ? (
          <div className="space-y-3 p-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase text-slate-400">
                  From
                </p>
                <Input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="h-9 border-slate-200"
                />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase text-slate-400">
                  To
                </p>
                <Input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="h-9 border-slate-200"
                />
              </div>
            </div>
            <CalendarPicker
              mode="range"
              selected={{
                from: customFrom ? new Date(customFrom) : undefined,
                to: customTo ? new Date(customTo) : undefined,
              }}
              onSelect={(range) => {
                if (range?.from) {
                  setCustomFrom(format(range.from, "yyyy-MM-dd"));
                }
                if (range?.to) {
                  setCustomTo(format(range.to, "yyyy-MM-dd"));
                }
              }}
              numberOfMonths={1}
              className="rounded-md border"
            />
            <Button
              className="w-full bg-[#1B6EF3] hover:bg-[#1558C8]"
              onClick={handleApplyCustom}
            >
              Apply Range
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
