"use client";

import { Loader2, Lock, MapPin, Navigation } from "lucide-react";

import { VerificationStatusBadge } from "@/components/onboarding/verification-status";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MapPlaceholderProps {
  latitude?: number;
  longitude?: number;
  locationLabel?: string;
  isVerified?: boolean;
  onUseCurrentLocation?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function MapPlaceholder({
  latitude = 19.076,
  longitude = 72.8777,
  locationLabel = "Primary Warehouse Terminal A",
  isVerified = false,
  onUseCurrentLocation,
  isLoading = false,
  className,
}: MapPlaceholderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-muted/30",
        className,
      )}
    >
      <div
        className="relative h-80 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300"
        style={{
          backgroundImage: `
            linear-gradient(rgba(11,25,48,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(11,25,48,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar/20 to-transparent" />

        <div className="absolute left-4 top-4 rounded-lg bg-card/95 p-3 shadow-card backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Active Shipments
          </p>
          <p className="text-2xl font-bold text-foreground">8,500</p>
          <p className="text-xs text-muted-foreground">UNITS</p>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="absolute -inset-4 animate-ping rounded-full bg-primary/20" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-elevated">
              <MapPin className="h-6 w-6 text-white" />
              {isVerified ? (
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-success">
                  <Lock className="h-3 w-3 text-white" />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-card px-4 py-2 shadow-elevated">
          <p className="text-center text-xs font-semibold uppercase text-primary">
            {isVerified ? "Verified Location" : "Selected Location"}
          </p>
          <p className="text-center text-sm font-medium">{locationLabel}</p>
          <p className="text-center text-xs text-muted-foreground">
            {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t bg-card p-4">
        <div className="flex items-center gap-3">
          {isVerified ? (
            <VerificationStatusBadge
              status="verified"
              label="Location Verified"
            />
          ) : (
            <VerificationStatusBadge status="idle" label="Not Verified" />
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" type="button">
            Allow Location Access
          </Button>
          <Button
            size="sm"
            onClick={onUseCurrentLocation}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            Use Current Location
          </Button>
        </div>
      </div>
    </div>
  );
}
