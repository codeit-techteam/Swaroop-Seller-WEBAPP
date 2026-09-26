const GPS_TIMEOUT_MS = 12_000;
const GEOCODER_TIMEOUT_MS = 8_000;

export type ResolvedSellerAddress = {
  label: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number;
  longitude: number;
};

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
          "Location is not supported in this browser.",
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
              "Allow location access to set your operating warehouse.",
            ),
          );
          return;
        }
        if (error.code === error.TIMEOUT) {
          reject(
            new SellerLocationAccessError(
              "TIMEOUT",
              "Taking longer than expected to find your location.",
            ),
          );
          return;
        }
        reject(
          new SellerLocationAccessError(
            "UNAVAILABLE",
            "Unable to read GPS right now. Try again or pick a saved address.",
          ),
        );
      },
      {
        enableHighAccuracy: true,
        timeout: GPS_TIMEOUT_MS,
        maximumAge: 5 * 60 * 1000,
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

    return {
      label: city || line1,
      addressLine: line1 || city,
      city: city || "Current location",
      state,
      pincode,
      country: firstNonEmpty(address.country_code)?.toUpperCase() || "IN",
      latitude,
      longitude,
    };
  } catch {
    return null;
  }
}

/** Browser GPS + OpenStreetMap reverse geocode for seller warehouse. */
export async function detectCurrentSellerAddress(): Promise<ResolvedSellerAddress> {
  const position = await withTimeout(
    readBrowserPosition(),
    GPS_TIMEOUT_MS + 500,
    "Taking longer than expected to find your location.",
  );

  const { latitude, longitude } = position.coords;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new SellerLocationAccessError(
      "UNAVAILABLE",
      "GPS coordinates were invalid.",
    );
  }

  const resolved = await reverseGeocodeOsm(latitude, longitude);
  if (!resolved) {
    return {
      label: "Current location",
      addressLine: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
      city: "Current location",
      state: "",
      pincode: "",
      country: "IN",
      latitude,
      longitude,
    };
  }
  return resolved;
}
