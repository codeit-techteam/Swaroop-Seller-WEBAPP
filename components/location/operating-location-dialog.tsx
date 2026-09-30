"use client";

import { AlertTriangle, Crosshair, Loader2, MapPin } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { AddressAutocomplete } from "@/components/location/address-autocomplete";
import {
  isMapPickerAvailable,
  LocationMapPicker,
} from "@/components/location/location-map-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  detectCurrentSellerAddress,
  normalizedToSellerAddress,
  type ResolvedSellerAddress,
  reverseGeocodeSellerPoint,
  SellerLocationAccessError,
} from "@/services/geo-location";
import {
  fetchLocationConfig,
  isLocationServiceDown,
  type LocationServiceError,
  LOW_ACCURACY_THRESHOLD_METERS,
  type NormalizedLocation,
} from "@/services/location-search";
import { useLocationStore } from "@/store/locationStore";
import type { SellerLocation } from "@/types/seller";

const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
/** GPS fixes this coarse cannot be saved until the pin is placed on the map. */
const UNUSABLE_ACCURACY_METERS = 1000;
const PIN_MOVE_THRESHOLD_METERS = 8;

const EMPTY_FORM = {
  name: "",
  addressLine: "",
  addressLine2: "",
  landmark: "",
  city: "",
  district: "",
  state: "",
  pincode: "",
};

type FormState = typeof EMPTY_FORM;
type FormKey = keyof FormState;

function distanceMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
) {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLng = (b.longitude - a.longitude) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.latitude * rad) *
      Math.cos(b.latitude * rad) *
      Math.sin(dLng / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

function toForm(address: ResolvedSellerAddress): FormState {
  return {
    name: "",
    addressLine: address.addressLine,
    addressLine2: address.addressLine2,
    landmark: address.landmark,
    city: address.city,
    district: address.district,
    state: address.state,
    pincode: address.pincode.replace(/\D/g, "").slice(0, 6),
  };
}

/**
 * Set the seller's operating / pickup location from a Google search result or
 * the device GPS. Nothing is saved until the seller confirms the pin and
 * address fields.
 */
export function OperatingLocationDialog({
  open,
  onOpenChange,
  startWithGps = false,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startWithGps?: boolean;
  onSaved?: (location: SellerLocation | null) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto">
        {open ? (
          <OperatingLocationBody
            startWithGps={startWithGps}
            onClose={() => onOpenChange(false)}
            onSaved={onSaved}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function OperatingLocationBody({
  startWithGps,
  onClose,
  onSaved,
}: {
  startWithGps: boolean;
  onClose: () => void;
  onSaved?: (location: SellerLocation | null) => void;
}) {
  const saveGeoLocation = useLocationStore((s) => s.saveGeoLocation);
  const [step, setStep] = useState<"search" | "confirm">("search");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [geo, setGeo] = useState<ResolvedSellerAddress | null>(null);
  const [searchEnabled, setSearchEnabled] = useState(true);
  const [searchNotice, setSearchNotice] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(startWithGps);
  const [refreshingPin, setRefreshingPin] = useState(false);
  const [saving, setSaving] = useState(false);
  const touchedRef = useRef(new Set<FormKey>());
  const pinRequestRef = useRef(0);

  const applyAddress = useCallback(
    (address: ResolvedSellerAddress, mode: "replace" | "merge") => {
      const next = toForm(address);
      setForm((prev) => {
        if (mode === "replace") return { ...next, name: prev.name };
        const merged = { ...prev };
        (Object.keys(next) as FormKey[]).forEach((key) => {
          if (key === "name") return;
          if (!touchedRef.current.has(key) || !prev[key].trim()) {
            merged[key] = next[key] || prev[key];
          }
        });
        return merged;
      });
      setGeo(address);
    },
    [],
  );

  const detectLocation = useCallback(async () => {
    try {
      const address = await detectCurrentSellerAddress();
      touchedRef.current.clear();
      applyAddress(address, "replace");
      setStep("confirm");
    } catch (error) {
      toast.error(
        error instanceof SellerLocationAccessError
          ? error.message
          : "Unable to detect your location. Search for the address instead.",
      );
    } finally {
      setDetecting(false);
    }
  }, [applyAddress]);

  useEffect(() => {
    let active = true;
    void fetchLocationConfig().then((config) => {
      if (!active) return;
      setSearchEnabled(config.autocompleteEnabled);
      setSearchNotice(
        config.autocompleteEnabled
          ? null
          : "Address search is unavailable right now. Use your current location instead.",
      );
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!startWithGps) return;
    const timer = setTimeout(() => void detectLocation(), 0);
    return () => clearTimeout(timer);
  }, [startWithGps, detectLocation]);

  function handleUseCurrentLocation() {
    setDetecting(true);
    void detectLocation();
  }

  function setField(key: FormKey, value: string) {
    touchedRef.current.add(key);
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handlePlaceSelected(location: NormalizedLocation) {
    touchedRef.current.clear();
    applyAddress(normalizedToSellerAddress(location), "replace");
    setStep("confirm");
  }

  const handleSearchError = useCallback((error: LocationServiceError) => {
    if (isLocationServiceDown(error)) {
      setSearchEnabled(false);
      setSearchNotice(error.message);
    }
  }, []);

  async function handlePinAdjusted(latitude: number, longitude: number) {
    if (
      geo &&
      distanceMeters(geo, { latitude, longitude }) < PIN_MOVE_THRESHOLD_METERS
    ) {
      return;
    }
    const requestId = ++pinRequestRef.current;
    setGeo((prev) =>
      prev
        ? {
            ...prev,
            latitude,
            longitude,
            accuracyMeters: null,
            source: "MAP_PIN",
          }
        : prev,
    );
    setRefreshingPin(true);
    try {
      const address = await reverseGeocodeSellerPoint(
        latitude,
        longitude,
        "MAP_PIN",
      );
      if (requestId !== pinRequestRef.current || !address) return;
      applyAddress(
        {
          ...address,
          latitude,
          longitude,
          accuracyMeters: null,
          source: "MAP_PIN",
        },
        "merge",
      );
    } finally {
      if (requestId === pinRequestRef.current) setRefreshingPin(false);
    }
  }

  const lowAccuracy =
    geo?.source === "GPS" &&
    geo.accuracyMeters != null &&
    geo.accuracyMeters > LOW_ACCURACY_THRESHOLD_METERS;
  const coordsUnusable =
    lowAccuracy && (geo?.accuracyMeters ?? 0) > UNUSABLE_ACCURACY_METERS;
  const showMap = Boolean(geo) && isMapPickerAvailable();

  async function handleSave() {
    if (!geo) return;
    if (coordsUnusable) {
      toast.error(
        showMap
          ? "Your GPS position is too imprecise. Move the map pin to the exact spot or search for the address."
          : "Your GPS position is too imprecise. Search for the address instead.",
      );
      return;
    }
    if (!form.city.trim() || !form.state.trim()) {
      toast.error("Enter the city and state for this location");
      return;
    }
    if (form.pincode && !PINCODE_REGEX.test(form.pincode)) {
      toast.error("Enter a valid 6-digit PIN code");
      return;
    }
    setSaving(true);
    try {
      const city = form.city.trim();
      const location = await saveGeoLocation({
        latitude: geo.latitude,
        longitude: geo.longitude,
        name: form.name.trim() || `${city} Warehouse`,
        addressLine: form.addressLine.trim() || geo.locality || city,
        addressLine2: form.addressLine2,
        landmark: form.landmark,
        locality: geo.locality,
        city,
        district: form.district,
        state: form.state.trim(),
        pincode: form.pincode,
        country: geo.country || "IN",
        placeId: geo.placeId,
        formattedAddress: geo.formattedAddress,
        accuracyMeters: geo.accuracyMeters,
        source: geo.source,
      });
      toast.success(
        location
          ? `Operating location set to ${location.city || city}`
          : "Operating location saved",
      );
      onSaved?.(location);
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Unable to save this location. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  const summary =
    geo?.formattedAddress ||
    [form.addressLine, form.city, form.state, form.pincode]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(", ");

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {step === "search"
            ? "Set operating location"
            : "Confirm operating location"}
        </DialogTitle>
        <DialogDescription>
          {step === "search"
            ? "Search your warehouse or pickup point, or use where you are now."
            : "Used for pickup, freight and nearby buyer demand. Buyers never see your exact address."}
        </DialogDescription>
      </DialogHeader>

      {step === "search" ? (
        <div className="space-y-4">
          {searchEnabled ? (
            <AddressAutocomplete
              autoFocus={!startWithGps}
              placeholder="Search warehouse area, street or PIN"
              onSelect={handlePlaceSelected}
              onError={handleSearchError}
              disabled={saving || detecting}
            />
          ) : null}
          {searchNotice ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {searchNotice}
            </p>
          ) : null}
          {searchEnabled ? (
            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              or
              <span className="h-px flex-1 bg-slate-200" />
            </div>
          ) : null}
          <button
            type="button"
            disabled={detecting || saving}
            onClick={handleUseCurrentLocation}
            className="flex w-full items-center gap-3 rounded-xl border border-[#1B6EF3]/30 bg-[#1B6EF3]/5 px-4 py-3 text-left transition hover:bg-[#1B6EF3]/10 disabled:opacity-60"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1B6EF3]/10 text-[#1B6EF3]">
              {detecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Crosshair className="h-4 w-4" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[#1B6EF3]">
                {detecting
                  ? "Detecting your location…"
                  : "Use current location"}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                You can adjust the pin before saving
              </span>
            </span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1B6EF3]/10 text-[#1B6EF3]">
              {refreshingPin ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-900">
                {geo?.label || form.city || "Selected location"}
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                {summary ||
                  "We couldn't resolve an address here. Fill in the details below."}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setStep("search")}
              className="shrink-0 text-xs font-semibold text-[#1B6EF3]"
            >
              Change
            </button>
          </div>

          {showMap && geo ? (
            <LocationMapPicker
              latitude={geo.latitude}
              longitude={geo.longitude}
              accuracyMeters={geo.source === "GPS" ? geo.accuracyMeters : null}
              onAdjust={(lat, lng) => void handlePinAdjusted(lat, lng)}
            />
          ) : null}

          {lowAccuracy ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                GPS accuracy is about {Math.round(geo?.accuracyMeters ?? 0)} m.{" "}
                {showMap
                  ? "Move the map so the pin sits exactly on your warehouse."
                  : "Search for the exact address for a precise pickup point."}
              </span>
            </div>
          ) : null}

          <div className="grid gap-3">
            <Field
              label="Location name"
              placeholder={
                form.city ? `${form.city} Warehouse` : "e.g. Main warehouse"
              }
              value={form.name}
              onChange={(value) => setField("name", value)}
            />
            <Field
              label="Address line 1"
              placeholder="Plot, building, street"
              value={form.addressLine}
              onChange={(value) => setField("addressLine", value)}
            />
            <Field
              label="Address line 2 (optional)"
              placeholder="Area, locality"
              value={form.addressLine2}
              onChange={(value) => setField("addressLine2", value)}
            />
            <Field
              label="Landmark (optional)"
              value={form.landmark}
              onChange={(value) => setField("landmark", value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="City"
                value={form.city}
                onChange={(value) => setField("city", value)}
              />
              <Field
                label="District (optional)"
                value={form.district}
                onChange={(value) => setField("district", value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="State"
                value={form.state}
                onChange={(value) => setField("state", value)}
              />
              <Field
                label="PIN code"
                value={form.pincode}
                inputMode="numeric"
                maxLength={6}
                invalid={
                  form.pincode.length > 0 && !PINCODE_REGEX.test(form.pincode)
                }
                onChange={(value) =>
                  setField("pincode", value.replace(/\D/g, "").slice(0, 6))
                }
              />
            </div>
          </div>
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        {step === "confirm" ? (
          <Button
            disabled={saving || refreshingPin || !geo}
            onClick={() => void handleSave()}
          >
            {saving ? "Saving…" : "Confirm & save"}
          </Button>
        ) : null}
      </DialogFooter>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  maxLength,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  invalid?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={invalid || undefined}
        className={cn(invalid && "border-red-300")}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
