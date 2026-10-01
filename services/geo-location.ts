import {
  LOCATION_ERROR_MESSAGES,
  type LocationCaptureSource,
  type NormalizedLocation,
  reverseGeocodeLocation,
} from "@/services/location-search";

const GPS_TIMEOUT_MS = 12_000;
const GEOCODER_TIMEOUT_MS = 8_000;

export type ResolvedSellerAddress = {
  label: string;
  addressLine: string;
  addressLine2: string;
  landmark: string;
  locality: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number;
  longitude: number;
  placeId: string | null;
  formattedAddress: string;
  accuracyMeters: number | null;
  source: LocationCaptureSource;
};

export function normalizedToSellerAddress(
  location: NormalizedLocation,
  accuracyMeters: number | null = null,
): ResolvedSellerAddress {
  return {
    label: location.name || location.locality || location.city,
    addressLine:
      location.addressLine1 || location.name || location.locality || "",
    addressLine2: location.addressLine2,
    landmark: location.landmark,
    locality: location.locality,
    city: location.city,
    district: location.district,
    state: location.state,
    pincode: location.postalCode,
    country: location.countryCode || "IN",
    latitude: location.latitude,
    longitude: location.longitude,
    placeId: location.placeId,
    formattedAddress: location.formattedAddress,
    accuracyMeters,
    source: location.source,
  };
}

export class SellerLocationAccessError extends Error {
  code:
    | "UNSUPPORTED"
    | "PERMISSION_DENIED"
    | "TIMEOUT"
    | "UNAVAILABLE"
    | "GEOCODE_FAILED";

  constructor(code: SellerLocationAccessError["code"], message: string) {
    super(message);
    this.name = "SellerLocationAccessError";
    this.code = code;
  }
}

function firstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new SellerLocationAccessError("TIMEOUT", message));
        }, ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function readBrowserPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(
        new SellerLocationAccessError(
          "UNSUPPORTED",
          LOCATION_ERROR_MESSAGES.LOCATION_UNSUPPORTED,
        ),
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(
            new SellerLocationAccessError(
              "PERMISSION_DENIED",
              LOCATION_ERROR_MESSAGES.LOCATION_PERMISSION_DENIED,
            ),
          );
          return;
        }
        if (error.code === error.TIMEOUT) {
          reject(
            new SellerLocationAccessError(
              "TIMEOUT",
              LOCATION_ERROR_MESSAGES.LOCATION_TIMEOUT,
            ),
          );
          return;
        }
        reject(
          new SellerLocationAccessError(
            "UNAVAILABLE",
            LOCATION_ERROR_MESSAGES.LOCATION_UNAVAILABLE,
          ),
        );
      },
      {
        enableHighAccuracy: true,
        timeout: GPS_TIMEOUT_MS,
        maximumAge: 30_000,
      },
    );
  });
}

async function reverseGeocodeOsm(
  latitude: number,
  longitude: number,
): Promise<ResolvedSellerAddress | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("zoom", "18");

    const response = await withTimeout(
      fetch(url.toString(), {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
        },
      }),
      GEOCODER_TIMEOUT_MS,
      "Address lookup timed out.",
    );

    if (!response.ok) return null;
    const data = (await response.json()) as {
      display_name?: string;
      address?: Record<string, string>;
    };
    const address = data.address ?? {};
    const city = firstNonEmpty(
      address.city,
      address.town,
      address.village,
      address.suburb,
      address.county,
      address.state_district,
    );
    const state = firstNonEmpty(address.state);
    const pincode = firstNonEmpty(address.postcode)
      .replace(/\D/g, "")
      .slice(0, 6);
    const line1 = firstNonEmpty(
      address.road,
      address.neighbourhood,
      address.suburb,
      data.display_name,
    );

    if (!city && !line1) return null;

    const area = firstNonEmpty(address.suburb, address.neighbourhood);
    return {
      label: area || city || line1,
      addressLine: line1 || city,
      addressLine2: area && area !== line1 ? area : "",
      landmark: "",
      locality: area,
      city,
      district: firstNonEmpty(address.state_district, address.county),
      state,
      pincode,
      country: firstNonEmpty(address.country_code)?.toUpperCase() || "IN",
      latitude,
      longitude,
      placeId: null,
      formattedAddress: (data.display_name ?? "").slice(0, 500),
      accuracyMeters: null,
      source: "GPS",
    };
  } catch {
    return null;
  }
}

/** Google reverse geocode via the backend proxy, OpenStreetMap as fallback. */
export async function reverseGeocodeSellerPoint(
  latitude: number,
  longitude: number,
  source: "GPS" | "MAP_PIN",
): Promise<ResolvedSellerAddress | null> {
  try {
    const location = await withTimeout(
      reverseGeocodeLocation(latitude, longitude, source),
      GEOCODER_TIMEOUT_MS,
      "Address lookup timed out.",
    );
    if (location.city || location.postalCode) {
      return normalizedToSellerAddress(location);
    }
  } catch {
    // Fall through to OpenStreetMap.
  }
  const fallback = await reverseGeocodeOsm(latitude, longitude);
  return fallback ? { ...fallback, source } : null;
}

/**
 * Browser GPS fix + reverse geocode for the seller's operating location.
 * Always returns the real device point; address fields may be empty when no
 * geocoder could resolve it, so the user completes them before saving.
 */
export type CurrentLocationPhase = "locating" | "resolving";

export const CURRENT_LOCATION_PHASE_LABELS: Record<
  CurrentLocationPhase,
  string
> = {
  locating: "Getting your location…",
  resolving: "Resolving address…",
};

export async function detectCurrentSellerAddress(
  onPhase?: (phase: CurrentLocationPhase) => void,
): Promise<ResolvedSellerAddress> {
  onPhase?.("locating");
  const position = await withTimeout(
    readBrowserPosition(),
    GPS_TIMEOUT_MS + 500,
    LOCATION_ERROR_MESSAGES.LOCATION_TIMEOUT,
  );

  const { latitude, longitude, accuracy } = position.coords;
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    (latitude === 0 && longitude === 0)
  ) {
    throw new SellerLocationAccessError(
      "UNAVAILABLE",
      LOCATION_ERROR_MESSAGES.LOCATION_UNAVAILABLE,
    );
  }
  const accuracyMeters = Number.isFinite(accuracy)
    ? Math.round(accuracy)
    : null;

  onPhase?.("resolving");
  const resolved = await reverseGeocodeSellerPoint(latitude, longitude, "GPS");
  if (resolved) return { ...resolved, accuracyMeters, source: "GPS" };
  return {
    label: "",
    addressLine: "",
    addressLine2: "",
    landmark: "",
    locality: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    country: "IN",
    latitude,
    longitude,
    placeId: null,
    formattedAddress: "",
    accuracyMeters,
    source: "GPS",
  };
}
