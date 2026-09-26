import { isAxiosError } from "axios";

import { apiClient } from "@/services/apiClient";
import { fetchSellerOnboarding } from "@/services/onboarding";
import type { SellerLocation } from "@/types/seller";

type Envelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type BackendLocation = {
  id: string;
  code?: string;
  name: string;
  city?: string | null;
  state?: string | null;
  country?: string;
  pincode?: string | null;
  status?: "active" | "inactive" | string;
  availableStockMt?: number;
  activeOffers?: number;
  source?: string;
  decisionMaker?: string | null;
  decisionMakerRole?: string | null;
};

type CurrentLocationPayload = {
  current: BackendLocation | null;
  locations: BackendLocation[];
  source?: string;
};

function mapLocation(row: BackendLocation): SellerLocation {
  const city = row.city?.trim() || "";
  const warehouse = row.name?.trim() || "Warehouse";
  return {
    id: row.id,
    name: city || warehouse,
    city: city || warehouse,
    state: row.state ?? "",
    warehouse,
    status: row.status === "inactive" ? "inactive" : "active",
    availableStockMt: Number(row.availableStockMt ?? 0),
    activeOffers: Number(row.activeOffers ?? 0),
    activeOrders: 0,
    decisionMaker: row.decisionMaker?.trim() || "",
    decisionMakerRole: row.decisionMakerRole?.trim() || "",
  };
}

function locationsApiError(error: unknown, fallback: string): Error {
  if (isAxiosError<{ message?: string | string[] }>(error)) {
    if (!error.response) {
      return new Error(
        "Unable to reach PetroTrade API. Confirm the backend is running.",
      );
    }
    const message = error.response.data?.message;
    if (typeof message === "string" && message.trim()) {
      return new Error(message);
    }
    if (Array.isArray(message) && message[0]) {
      return new Error(String(message[0]));
    }
    if (error.response.status === 429) {
      return new Error("Too many location requests. Please retry shortly.");
    }
  }
  if (error instanceof Error && error.message) return error;
  return new Error(fallback);
}

async function locationsFromOnboarding(): Promise<SellerLocation[]> {
  try {
    const record = await fetchSellerOnboarding();
    const location = (record.locationData ?? {}) as Record<string, unknown>;
    const address = (record.addressData ?? {}) as Record<string, unknown>;
    const city = String(location.city ?? address.city ?? "").trim();
    const state = String(location.state ?? address.state ?? "").trim();
    const warehouse =
      String(
        location.warehouseName ??
          location.warehouseAddress ??
          address.line1 ??
          "",
      ).trim() || (city ? `${city} Warehouse` : "Primary Warehouse");

    if (!city && !warehouse) return [];

    return [
      {
        id: `saved-onboarding-${record.id}`,
        name: city || warehouse,
        city: city || warehouse,
        state,
        warehouse,
        status: "active",
        availableStockMt: 0,
        activeOffers: 0,
        activeOrders: 0,
        decisionMaker: "",
        decisionMakerRole: "",
      },
    ];
  } catch {
    return [];
  }
}

export async function fetchSellerLocations(): Promise<SellerLocation[]> {
  try {
    const response =
      await apiClient.get<Envelope<BackendLocation[]>>("/seller/locations");
    const rows = Array.isArray(response.data.data) ? response.data.data : [];
    if (rows.length) return rows.map(mapLocation);
    return locationsFromOnboarding();
  } catch (error) {
    const fallback = await locationsFromOnboarding();
    if (fallback.length) return fallback;
    throw locationsApiError(error, "Unable to load operating locations.");
  }
}

export async function fetchCurrentSellerLocation(): Promise<{
  current: SellerLocation | null;
  locations: SellerLocation[];
  source?: string;
}> {
  try {
    const response = await apiClient.get<Envelope<CurrentLocationPayload>>(
      "/seller/locations/current",
      { timeout: 12_000 },
    );
    const payload = response.data.data;
    const locations = (payload?.locations ?? []).map(mapLocation);
    if (!locations.length) {
      const saved = await locationsFromOnboarding();
      return {
        current: saved[0] ?? null,
        locations: saved,
        source: saved.length ? "onboarding" : "empty",
      };
    }
    const current = payload?.current
      ? mapLocation(payload.current)
      : (locations[0] ?? null);
    return { current, locations, source: payload?.source };
  } catch (error) {
    try {
      const locations = await fetchSellerLocations();
      return {
        current: locations[0] ?? null,
        locations,
        source: locations.length ? "list-fallback" : "empty",
      };
    } catch {
      const saved = await locationsFromOnboarding();
      if (saved.length) {
        return {
          current: saved[0] ?? null,
          locations: saved,
          source: "onboarding",
        };
      }
      throw locationsApiError(error, "Unable to load current location.");
    }
  }
}

export async function setCurrentSellerLocation(warehouseId: string) {
  if (warehouseId.startsWith("saved-onboarding-")) {
    throw new Error(
      "Saved onboarding location is read-only until a warehouse is provisioned.",
    );
  }
  const response = await apiClient.post<Envelope<CurrentLocationPayload>>(
    "/seller/locations/current",
    { warehouseId },
  );
  const payload = response.data.data;
  return {
    current: payload?.current ? mapLocation(payload.current) : null,
    locations: (payload?.locations ?? []).map(mapLocation),
  };
}

export async function saveSellerLocationFromGeo(input: {
  latitude: number;
  longitude: number;
  name?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}) {
  const response = await apiClient.post<Envelope<CurrentLocationPayload>>(
    "/seller/locations/from-geo",
    input,
  );
  const payload = response.data.data;
  return {
    current: payload?.current ? mapLocation(payload.current) : null,
    locations: (payload?.locations ?? []).map(mapLocation),
  };
}
