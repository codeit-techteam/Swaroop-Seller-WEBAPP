"use client";

import { Check, Crosshair, MapPin, RefreshCw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { OperatingLocationDialog } from "@/components/location/operating-location-dialog";
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
import { useAuthStore } from "@/store/authStore";
import { useLocationStore } from "@/store/locationStore";
import { useSellerOfferStore } from "@/store/sellerOfferStore";
import { useSellerOrderStore } from "@/store/sellerOrderStore";

function locationLabel(location: {
  name: string;
  city: string;
  warehouse: string;
}) {
  const city = location.city?.trim() || location.name?.trim();
  const warehouse = location.warehouse?.trim();
  if (city && warehouse && city !== warehouse) {
    return `${city}`;
  }
  return city || warehouse || "Location";
}

export function LocationSelector({ compact = false }: { compact?: boolean }) {
  const authReady = useAuthStore((s) => s.hasHydrated && s.isAuthenticated);
  const locations = useLocationStore((s) => s.locations);
  const selectedLocationId = useLocationStore((s) => s.selectedLocationId);
  const setSelectedLocation = useLocationStore((s) => s.setSelectedLocation);
  const hydrate = useLocationStore((s) => s.hydrate);
  const loading = useLocationStore((s) => s.loading);
  const detecting = useLocationStore((s) => s.detecting);
  const hydrated = useLocationStore((s) => s.hydrated);
  const loadError = useLocationStore((s) => s.loadError);
  const hydrateOffers = useSellerOfferStore((s) => s.hydrate);
  const hydrateOrders = useSellerOrderStore((s) => s.hydrate);
  const [dialog, setDialog] = useState<{ open: boolean; gps: boolean }>({
    open: false,
    gps: false,
  });
  const selected =
    locations.find((location) => location.id === selectedLocationId) ??
    locations[0];

  useEffect(() => {
    if (!authReady) return;
    if (!hydrated && !loading) {
      void hydrate();
    }
  }, [authReady, hydrate, hydrated, loading]);

  const refreshLinkedData = async () => {
    await Promise.all([hydrateOffers(), hydrateOrders()]);
  };

  const openLocationDialog = (gps: boolean) => setDialog({ open: true, gps });

  const locationDialog = (
    <OperatingLocationDialog
      open={dialog.open}
      startWithGps={dialog.gps}
      onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}
      onSaved={() => {
        void refreshLinkedData().catch(() =>
          toast.error("Location saved, but refreshing offers failed."),
        );
      }}
    />
  );

  if (!selected && (loading || detecting)) {
    return (
      <Button
        variant="outline"
        className="h-9 gap-2 border-slate-200 bg-white px-3 text-slate-500"
        disabled
      >
        <MapPin className="h-4 w-4 animate-pulse" />
        {detecting ? "Detecting…" : "Loading…"}
      </Button>
    );
  }

  if (!selected) {
    return (
      <>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-9 gap-2 border-amber-200 bg-amber-50 px-3 text-amber-800"
              title={loadError ?? "Set your operating location"}
            >
              <MapPin className="h-4 w-4" />
              Set location
              <RefreshCw
                className={cn("h-3.5 w-3.5", detecting && "animate-spin")}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Operating location</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => openLocationDialog(false)}
              className="gap-2"
            >
              <Search className="h-4 w-4 text-[#1B6EF3]" />
              Search a location
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={detecting}
              onClick={() => openLocationDialog(true)}
              className="gap-2"
            >
              <Crosshair className="h-4 w-4 text-[#1B6EF3]" />
              Use current location
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={loading}
              onClick={() => void hydrate({ force: true })}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Load saved addresses
            </DropdownMenuItem>
            {loadError ? (
              <>
                <DropdownMenuSeparator />
                <p className="px-2 py-1.5 text-[11px] text-amber-700">
                  {loadError}
                </p>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
        {locationDialog}
      </>
    );
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-9 max-w-[220px] gap-2 border-slate-200 bg-white px-3 text-left font-medium text-slate-700",
              compact && "px-2",
            )}
            aria-label="Switch operating location"
          >
            <MapPin className="h-4 w-4 shrink-0 text-[#1B6EF3]" />
            {!compact ? (
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate">{locationLabel(selected)}</span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    selected.status === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500",
                  )}
                >
                  {selected.status === "active" ? "CURRENT" : "INACTIVE"}
                </span>
              </span>
            ) : (
              <span className="sr-only">{locationLabel(selected)}</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="flex items-center justify-between gap-2">
            <span>Operating locations</span>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1B6EF3]"
              onClick={(event) => {
                event.preventDefault();
                void hydrate({ force: true });
              }}
            >
              <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
              Refresh
            </button>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => openLocationDialog(false)}
            className="gap-2"
          >
            <Search className="h-4 w-4 text-[#1B6EF3]" />
            Search a location
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={detecting}
            onClick={() => openLocationDialog(true)}
            className="gap-2"
          >
            <Crosshair className="h-4 w-4 text-[#1B6EF3]" />
            Use current location
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {locations.map((location) => {
            const isCurrent = location.id === selected.id;
            return (
              <DropdownMenuItem
                key={location.id}
                onClick={() => {
                  void setSelectedLocation(location.id)
                    .then(() => refreshLinkedData())
                    .catch((error: unknown) =>
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "Unable to switch location",
                      ),
                    );
                }}
                className="flex items-start justify-between gap-2"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {locationLabel(location)}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {location.warehouse}
                    {location.state ? ` · ${location.state}` : ""}
                  </span>
                </span>
                {isCurrent ? (
                  <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase text-[#1B6EF3]">
                    <Check className="h-3.5 w-3.5" />
                    Current
                  </span>
                ) : null}
              </DropdownMenuItem>
            );
          })}
          {loadError ? (
            <>
              <DropdownMenuSeparator />
              <p className="px-2 py-1.5 text-[11px] text-amber-700">
                {loadError}
              </p>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      {locationDialog}
    </>
  );
}
