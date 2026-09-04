import { create } from "zustand";
import { persist } from "zustand/middleware";

import { STORAGE_KEYS } from "@/lib/constants";
import { sellerLocationsMock } from "@/lib/mock/locations";
import type { LocationStatus, SellerLocation } from "@/types/seller";

interface LocationState {
  locations: SellerLocation[];
  selectedLocationId: string;
  setSelectedLocation: (id: string) => void;
  toggleLocationStatus: (id: string) => void;
  updateLocation: (id: string, data: Partial<SellerLocation>) => void;
  addLocation: (location: Omit<SellerLocation, "id">) => void;
  getSelectedLocation: () => SellerLocation | undefined;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      locations: sellerLocationsMock,
      selectedLocationId: "loc-chennai",
      setSelectedLocation: (id) => set({ selectedLocationId: id }),
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
        return locations.find((location) => location.id === selectedLocationId);
      },
    }),
    {
      name: STORAGE_KEYS.SELECTED_LOCATION,
      partialize: (state) => ({
        selectedLocationId: state.selectedLocationId,
      }),
    },
  ),
);
