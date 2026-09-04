"use client";

import { Check, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLocationStore } from "@/store/locationStore";

export function LocationSelector({ compact = false }: { compact?: boolean }) {
  const locations = useLocationStore((s) => s.locations);
  const selectedLocationId = useLocationStore((s) => s.selectedLocationId);
  const setSelectedLocation = useLocationStore((s) => s.setSelectedLocation);
  const selected =
    locations.find((location) => location.id === selectedLocationId) ??
    locations[0];

  if (!selected) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 gap-2 border-slate-200 bg-white px-3 text-left font-medium text-slate-700",
            compact && "px-2",
          )}
          aria-label="Switch operating location"
        >
          <MapPin className="h-4 w-4 text-[#1B6EF3]" />
          {!compact ? (
            <span className="flex items-center gap-2">
              <span>{selected.name}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  selected.status === "active"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500",
                )}
              >
                {selected.status === "active" ? "ACTIVE" : "INACTIVE"}
              </span>
            </span>
          ) : (
            <span className="sr-only">{selected.name}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Operating locations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {locations.map((location) => (
          <DropdownMenuItem
            key={location.id}
            onClick={() => setSelectedLocation(location.id)}
            className="flex items-center justify-between gap-2"
          >
            <span>
              <span className="block text-sm font-medium">{location.name}</span>
              <span className="text-xs text-muted-foreground">
                {location.warehouse} ·{" "}
                {location.status === "active" ? "ACTIVE" : "INACTIVE"}
              </span>
            </span>
            {location.id === selected.id ? (
              <Check className="h-4 w-4 text-[#1B6EF3]" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
