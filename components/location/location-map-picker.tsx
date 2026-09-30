/// <reference types="google.maps" />
"use client";

import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { GOOGLE_MAPS_BROWSER_KEY } from "@/lib/constants";
import { cn } from "@/lib/utils";

const MAPS_SCRIPT_ID = "swaroop-google-maps-js";
const MAPS_CALLBACK = "__swaroopMapsReady";

let mapsLoader: Promise<void> | null = null;

function mapsApiKey(): string {
  const key = GOOGLE_MAPS_BROWSER_KEY.trim();
  return key && !key.includes("placeholder") ? key : "";
}

/** Loads the Maps JavaScript API once with the referrer-restricted browser key. */
function loadGoogleMaps(key: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  if (typeof google !== "undefined" && google.maps?.Map) {
    return Promise.resolve();
  }
  if (mapsLoader) return mapsLoader;

  mapsLoader = new Promise<void>((resolve, reject) => {
    const scope = window as unknown as Record<string, unknown>;
    scope[MAPS_CALLBACK] = () => resolve();
    const script = document.createElement("script");
    script.id = MAPS_SCRIPT_ID;
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&language=en&region=IN&callback=${MAPS_CALLBACK}`;
    script.onerror = () => {
      mapsLoader = null;
      script.remove();
      reject(new Error("maps_load_failed"));
    };
    document.head.appendChild(script);
  });
  return mapsLoader;
}

export function isMapPickerAvailable(): boolean {
  return Boolean(mapsApiKey());
}

/**
 * Confirmation map with a fixed centre pin: the user drags the map under the
 * pin and `onAdjust` fires once the map settles on a new point.
 */
export function LocationMapPicker({
  latitude,
  longitude,
  accuracyMeters,
  onAdjust,
  className,
}: {
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  onAdjust?: (latitude: number, longitude: number) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const userMovedRef = useRef(false);
  const onAdjustRef = useRef(onAdjust);
  const coordsRef = useRef({ lat: latitude, lng: longitude });
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [failed, setFailed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const key = mapsApiKey();

  useEffect(() => {
    onAdjustRef.current = onAdjust;
  }, [onAdjust]);

  useEffect(() => {
    coordsRef.current = { lat: latitude, lng: longitude };
  }, [latitude, longitude]);

  useEffect(() => {
    if (!key || !containerRef.current) return;
    let cancelled = false;
    const listeners: google.maps.MapsEventListener[] = [];

    loadGoogleMaps(key)
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const instance = new google.maps.Map(containerRef.current, {
          center: coordsRef.current,
          zoom: 17,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          gestureHandling: "greedy",
          keyboardShortcuts: false,
        });
        listeners.push(
          instance.addListener("dragstart", () => {
            userMovedRef.current = true;
            setDragging(true);
            circleRef.current?.setMap(null);
          }),
          instance.addListener("idle", () => {
            setDragging(false);
            if (!userMovedRef.current) return;
            userMovedRef.current = false;
            const center = instance.getCenter();
            if (center) onAdjustRef.current?.(center.lat(), center.lng());
          }),
        );
        setMap(instance);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      listeners.forEach((listener) => listener.remove());
      circleRef.current?.setMap(null);
      circleRef.current = null;
    };
  }, [key]);

  useEffect(() => {
    if (!map) return;
    const center = map.getCenter();
    const moved =
      !center ||
      Math.abs(center.lat() - latitude) > 1e-6 ||
      Math.abs(center.lng() - longitude) > 1e-6;
    if (moved) map.panTo({ lat: latitude, lng: longitude });
  }, [map, latitude, longitude]);

  useEffect(() => {
    if (!map) return;
    if (!accuracyMeters || accuracyMeters < 25) {
      circleRef.current?.setMap(null);
      return;
    }
    circleRef.current ??= new google.maps.Circle({
      strokeColor: "#2563eb",
      strokeOpacity: 0.35,
      strokeWeight: 1,
      fillColor: "#2563eb",
      fillOpacity: 0.08,
      clickable: false,
    });
    circleRef.current.setOptions({
      map,
      center: { lat: latitude, lng: longitude },
      radius: accuracyMeters,
    });
  }, [map, accuracyMeters, latitude, longitude]);

  if (!key || failed) return null;

  return (
    <div
      className={cn(
        "relative h-44 overflow-hidden rounded-xl border border-slate-200 bg-slate-100",
        className,
      )}
    >
      <div
        ref={containerRef}
        className="absolute inset-0"
        aria-label="Map — drag to adjust the delivery pin"
        role="application"
      />
      <MapPin
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-full fill-[#1B6EF3] text-white drop-shadow transition-transform",
          dragging && "-translate-y-[calc(100%+6px)]",
        )}
      />
      <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-slate-600 shadow-sm">
        Move the map to place the pin exactly
      </span>
    </div>
  );
}
