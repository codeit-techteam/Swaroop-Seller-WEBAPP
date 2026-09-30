import axios from "axios";

import { apiClient } from "@/services/apiClient";

type Envelope<T> = { success: boolean; data: T; message?: string };

/**
 * Client for the shared backend geo service (`/locations/*`). Every Google
 * Maps Platform call is proxied by the backend, so no Places/Geocoding key
 * ever ships in the browser bundle.
 */

export type LocationCaptureSource = "AUTOCOMPLETE" | "GPS" | "MAP_PIN";
export type AddressCaptureSource = LocationCaptureSource | "PINCODE" | "MANUAL";

export type NormalizedLocation = {
  placeId: string | null;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  locality: string;
  city: string;
  district: string;
  state: string;
  stateCode: string;
  postalCode: string;
  country: string;
  countryCode: string;
  source: LocationCaptureSource;
};

export type LocationSuggestion = {
  placeId: string;
  primaryText: string;
  secondaryText: string;
  fullText: string;
  types: string[];
  distanceMeters: number | null;
};

export type LocationServiceConfig = {
  provider: "google" | "none";
  autocompleteEnabled: boolean;
  reverseGeocodeEnabled: boolean;
  regionCode: string;
  minQueryLength: number;
  attribution: string | null;
};

export type LocationErrorCode =
  | "LOCATION_PERMISSION_DENIED"
  | "LOCATION_UNAVAILABLE"
  | "LOCATION_TIMEOUT"
  | "LOCATION_UNSUPPORTED"
  | "LOCATION_SERVICE_NOT_CONFIGURED"
  | "GOOGLE_API_UNAVAILABLE"
  | "AUTOCOMPLETE_FAILED"
  | "PLACE_NOT_FOUND"
  | "GEOCODING_FAILED"
  | "INVALID_COORDINATES"
  | "LOCATION_RATE_LIMITED"
  | "NETWORK_ERROR";

export const LOCATION_ERROR_MESSAGES: Record<LocationErrorCode, string> = {
  LOCATION_PERMISSION_DENIED:
    "Location permission is off. Allow location access in your browser settings, or search for your address instead.",
  LOCATION_UNAVAILABLE:
    "We couldn't read your location right now. Search for your address instead.",
  LOCATION_TIMEOUT:
    "Finding your location is taking too long. Try again or search for your address.",
  LOCATION_UNSUPPORTED:
    "This browser doesn't support location access. Search for your address instead.",
  LOCATION_SERVICE_NOT_CONFIGURED:
    "Address search is temporarily unavailable. Please enter your address manually.",
  GOOGLE_API_UNAVAILABLE:
    "Address search is temporarily unavailable. Please try again or enter your address manually.",
  AUTOCOMPLETE_FAILED:
    "Unable to load address suggestions right now. Please try again.",
  PLACE_NOT_FOUND:
    "We could not find that place. Please pick another suggestion.",
  GEOCODING_FAILED:
    "Unable to resolve an address for this location. Please search for your address manually.",
  INVALID_COORDINATES: "The selected location coordinates are invalid.",
  LOCATION_RATE_LIMITED:
    "Too many address lookups. Please wait a moment and try again.",
  NETWORK_ERROR:
    "You appear to be offline. Check your connection and try again.",
};

export class LocationServiceError extends Error {
  readonly code: LocationErrorCode;

  constructor(code: LocationErrorCode, message?: string) {
    super(message ?? LOCATION_ERROR_MESSAGES[code]);
    this.name = "LocationServiceError";
    this.code = code;
  }
}

const SERVER_CODES = new Set<LocationErrorCode>([
  "LOCATION_SERVICE_NOT_CONFIGURED",
  "GOOGLE_API_UNAVAILABLE",
  "AUTOCOMPLETE_FAILED",
  "PLACE_NOT_FOUND",
  "GEOCODING_FAILED",
  "INVALID_COORDINATES",
  "LOCATION_RATE_LIMITED",
]);

export function isAbortError(error: unknown): boolean {
  return (
    axios.isCancel(error) ||
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "CanceledError")
  );
}

export function toLocationError(
  error: unknown,
  fallback: LocationErrorCode,
): LocationServiceError {
  if (error instanceof LocationServiceError) return error;
  if (axios.isAxiosError(error)) {
    if (!error.response) return new LocationServiceError("NETWORK_ERROR");
    const body = error.response.data as { code?: unknown; message?: unknown };
    const code = typeof body?.code === "string" ? body.code : "";
    if (SERVER_CODES.has(code as LocationErrorCode)) {
      const message =
        typeof body.message === "string" ? body.message : undefined;
      return new LocationServiceError(code as LocationErrorCode, message);
    }
    if (error.response.status === 429) {
      return new LocationServiceError("LOCATION_RATE_LIMITED");
    }
  }
  return new LocationServiceError(fallback);
}

/** Errors where the Google-backed path is down and a fallback should be offered. */
export function isLocationServiceDown(error: unknown): boolean {
  return (
    error instanceof LocationServiceError &&
    (error.code === "LOCATION_SERVICE_NOT_CONFIGURED" ||
      error.code === "GOOGLE_API_UNAVAILABLE")
  );
}

/**
 * Autocomplete session token (billing unit): reused across every keystroke of
 * one search plus the final place-details call, then discarded.
 */
export function createSessionToken(): string {
  const cryptoApi = globalThis.crypto as Crypto | undefined;
  if (typeof cryptoApi?.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (cryptoApi) {
    cryptoApi.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

let configPromise: Promise<LocationServiceConfig> | null = null;

const DISABLED_CONFIG: LocationServiceConfig = {
  provider: "none",
  autocompleteEnabled: false,
  reverseGeocodeEnabled: false,
  regionCode: "IN",
  minQueryLength: 2,
  attribution: null,
};

export function fetchLocationConfig(): Promise<LocationServiceConfig> {
  if (!configPromise) {
    configPromise = apiClient
      .get<Envelope<LocationServiceConfig>>("/locations/config")
      .then((response) => response.data.data ?? DISABLED_CONFIG)
      .catch(() => {
        configPromise = null;
        return DISABLED_CONFIG;
      });
  }
  return configPromise;
}

export async function searchLocations(
  input: string,
  options: {
    sessionToken: string;
    near?: { latitude: number; longitude: number } | null;
    signal?: AbortSignal;
  },
): Promise<LocationSuggestion[]> {
  try {
    const { data: payload } = await apiClient.get<
      Envelope<LocationSuggestion[]>
    >("/locations/autocomplete", {
      params: {
        input,
        sessionToken: options.sessionToken,
        ...(options.near
          ? { lat: options.near.latitude, lng: options.near.longitude }
          : {}),
      },
      signal: options.signal,
    });
    return payload.data ?? [];
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw toLocationError(error, "AUTOCOMPLETE_FAILED");
  }
}

export async function fetchPlaceLocation(
  placeId: string,
  options: {
    sessionToken?: string | null;
    name?: string;
    signal?: AbortSignal;
  },
): Promise<NormalizedLocation> {
  try {
    const { data: payload } = await apiClient.get<Envelope<NormalizedLocation>>(
      `/locations/places/${encodeURIComponent(placeId)}`,
      {
        params: {
          ...(options.sessionToken
            ? { sessionToken: options.sessionToken }
            : {}),
          ...(options.name ? { name: options.name.slice(0, 120) } : {}),
        },
        signal: options.signal,
      },
    );
    return payload.data;
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw toLocationError(error, "PLACE_NOT_FOUND");
  }
}

export async function reverseGeocodeLocation(
  latitude: number,
  longitude: number,
  source: "GPS" | "MAP_PIN",
  signal?: AbortSignal,
): Promise<NormalizedLocation> {
  try {
    const { data: payload } = await apiClient.get<Envelope<NormalizedLocation>>(
      "/locations/reverse-geocode",
      { params: { lat: latitude, lng: longitude, source }, signal },
    );
    return payload.data;
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw toLocationError(error, "GEOCODING_FAILED");
  }
}

export function formatDistance(meters: number | null | undefined): string {
  if (meters == null || !Number.isFinite(meters)) return "";
  if (meters < 1000) return `${Math.max(1, Math.round(meters / 10) * 10)} m`;
  const km = meters / 1000;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

/** GPS fixes worse than this are flagged and must be confirmed on the map. */
export const LOW_ACCURACY_THRESHOLD_METERS = 100;
