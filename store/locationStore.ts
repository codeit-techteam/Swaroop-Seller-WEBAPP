import { create } from "zustand";
import { persist } from "zustand/middleware";

import { STORAGE_KEYS } from "@/lib/constants";
import {
  detectCurrentSellerAddress,
  SellerLocationAccessError,
} from "@/services/geo-location";
import {
  fetchCurrentSellerLocation,
  fetchSellerLocations,
  saveSellerLocationFromGeo,
  setCurrentSellerLocation,
} from "@/services/locations";
import type { LocationStatus, SellerLocation } from "@/types/seller";

const LOCATION_STORAGE_KEY = `${STORAGE_KEYS.SELECTED_LOCATION}_v3`;

interface LocationState {
  locations: SellerLocation[];
  selectedLocationId: string;
  loading: boolean;
  detecting: boolean;
  /** True after the first hydrate attempt finishes (success or failure). */
  hydrated: boolean;
  loadError: string | null;
  hydrate: (options?: { force?: boolean }) => Promise<void>;
  detectAndSaveCurrentLocation: () => Promise<SellerLocation | null>;
  setSelectedLocation: (id: string) => Promise<void>;
  toggleLocationStatus: (id: string) => void;
  updateLocation: (id: string, data: Partial<SellerLocation>) => void;
  addLocation: (location: Omit<SellerLocation, "id">) => void;
  getSelectedLocation: () => SellerLocation | undefined;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      locations: [],
      selectedLocationId: "",
      loading: false,
      detecting: false,
      hydrated: false,
      loadError: null,
      hydrate: async (options) => {
        const { force = false } = options ?? {};
        const state = get();
        if (state.loading) return;
        // Skip re-fetch when we already have a usable cached location unless forced.
        if (
          state.hydrated &&
          !force &&
          state.locations.length > 0 &&
          state.selectedLocationId
        ) {
          return;
        }

        set({ loading: true, loadError: null });
        try {
          let current: SellerLocation | null = null;
          let locations: SellerLocation[] = [];

          try {
            const payload = await fetchCurrentSellerLocation();
            current = payload.current;
            locations = payload.locations;
          } catch {
            locations = await fetchSellerLocations();
            current = locations[0] ?? null;
          }

          if (!locations.length) {
            locations = await fetchSellerLocations().catch(() => []);
            current = locations[0] ?? current;
          }

          const preferred =
            current?.id ||
            (locations.some((row) => row.id === state.selectedLocationId)
              ? state.selectedLocationId
              : "") ||
            locations[0]?.id ||
            "";

          set({
            locations,
            selectedLocationId: preferred,
            loading: false,
            hydrated: true,
            loadError: locations.length
              ? null
              : "No operating locations yet. Use current location to set one.",
          });
        } catch (error) {
          // Keep any previously cached locations so the header still shows
          // the seller's last known / saved location.
          const cached = get().locations;
          set({
            loading: false,
            hydrated: true,
            loadError:
              error instanceof Error
                ? error.message
                : "Unable to load operating locations.",
            ...(cached.length ? {} : { locations: [], selectedLocationId: "" }),
          });
        }
      },
      detectAndSaveCurrentLocation: async () => {
        set({ detecting: true, loadError: null });
        try {
          const address = await detectCurrentSellerAddress();
          const { current, locations } = await saveSellerLocationFromGeo({
            latitude: address.latitude,
            longitude: address.longitude,
            name: `${address.city} Warehouse`,
            addressLine: address.addressLine,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            country: address.country,
          });
          const selected = current ?? locations[0] ?? null;
          set({
            locations: locations.length ? locations : get().locations,
            selectedLocationId: selected?.id ?? get().selectedLocationId,
            detecting: false,
            hydrated: true,
            loadError: null,
          });
          return selected;
        } catch (error) {
          const message =
            error instanceof SellerLocationAccessError
              ? error.message
              : error instanceof Error
                ? error.message
                : "Unable to detect current location.";
          set({ detecting: false, loadError: message });
          throw new Error(message);
        }
      },
      setSelectedLocation: async (id) => {
        if (id.startsWith("saved-onboarding-")) {
          set({ selectedLocationId: id });
          return;
        }
        const previous = get().selectedLocationId;
        set({ selectedLocationId: id });
        try {
          const { current, locations } = await setCurrentSellerLocation(id);
          set({
            locations: locations.length ? locations : get().locations,
            selectedLocationId: current?.id ?? id,
            loadError: null,
          });
        } catch {
          set({ selectedLocationId: previous });
          throw new Error("Unable to update current location.");
        }
      },
      toggleLocationStatus: (id) =>
        set((state) => ({
          locations: state.locations.map((location) =>
            location.id === id
              ? {
                  ...location,
                  status: (location.status === "active"
                    ? "inactive"
                    : "active") as LocationStatus,
                }
              : location,
          ),
        })),
      updateLocation: (id, data) =>
        set((state) => ({
          locations: state.locations.map((location) =>
            location.id === id ? { ...location, ...data } : location,
          ),
        })),
      addLocation: (location) =>
        set((state) => ({
          locations: [
            ...state.locations,
            { ...location, id: `loc-${Date.now()}` },
          ],
        })),
      getSelectedLocation: () => {
        const { locations, selectedLocationId } = get();
        return (
          locations.find((location) => location.id === selectedLocationId) ??
          locations[0]
        );
      },
    }),
    {
      name: LOCATION_STORAGE_KEY,
      // Persist last known locations so the header can render immediately
      // with the seller's current/saved location while a refresh runs.
      partialize: (state) => ({
        selectedLocationId: state.selectedLocationId,
        locations: state.locations,
      }),
    },
  ),
);
