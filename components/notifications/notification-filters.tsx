"use client";

import { CalendarDays, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { NotificationFilters } from "@/types/notifications";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
} from "@/types/notifications";

interface NotificationFiltersBarProps {
  filters: NotificationFilters;
  search: string;
  onFilterChange: <K extends keyof NotificationFilters>(
    key: K,
    value: NotificationFilters[K],
  ) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  className?: string;
}

export function NotificationFiltersBar({
  filters,
  search,
  onFilterChange,
  onSearchChange,
  onClearFilters,
  hasActiveFilters,
  className,
}: NotificationFiltersBarProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={filters.datePreset}
          onValueChange={(value) =>
            onFilterChange(
              "datePreset",
              value as NotificationFilters["datePreset"],
            )
          }
        >
          <SelectTrigger className="h-9 w-[160px] border-slate-200 bg-white text-sm">
            <CalendarDays className="mr-2 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Today">Today</SelectItem>
            <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
            <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.category}
          onValueChange={(value) =>
            onFilterChange("category", value as NotificationFilters["category"])
          }
        >
          <SelectTrigger className="h-9 min-w-[200px] border-slate-200 bg-white text-sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Categories">
              Category: All Categories
            </SelectItem>
            {NOTIFICATION_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(value) =>
            onFilterChange("priority", value as NotificationFilters["priority"])
          }
        >
          <SelectTrigger className="h-9 min-w-[160px] border-slate-200 bg-white text-sm">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Priorities">Priority: All</SelectItem>
            {NOTIFICATION_PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                Priority: {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.readStatus}
          onValueChange={(value) =>
            onFilterChange(
              "readStatus",
              value as NotificationFilters["readStatus"],
            )
          }
        >
          <SelectTrigger className="h-9 min-w-[130px] border-slate-200 bg-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Unread">Unread</SelectItem>
            <SelectItem value="Read">Read</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search notifications..."
            className="h-9 border-slate-200 bg-white pl-9 pr-8 text-sm"
          />
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        <Button
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className="ml-auto h-9 bg-[#0B1F3A] px-4 text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-[#122846] disabled:opacity-50"
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );
}
