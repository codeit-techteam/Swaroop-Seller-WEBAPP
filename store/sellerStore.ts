import { create } from "zustand";
import { persist } from "zustand/middleware";

import { sellerProfileMock } from "@/lib/mock/locations";
import { sellerActivityMock } from "@/lib/mock/notifications";
import type { SellerActivity, SellerProfile } from "@/types/seller";

interface SellerState {
  seller: SellerProfile;
  activity: SellerActivity[];
  updateSeller: (data: Partial<SellerProfile>) => void;
  addActivity: (activity: Omit<SellerActivity, "id" | "at">) => void;
}

export const useSellerStore = create<SellerState>()(
  persist(
    (set) => ({
      seller: sellerProfileMock,
      activity: sellerActivityMock,
      updateSeller: (data) =>
        set((state) => ({
          seller: { ...state.seller, ...data },
        })),
      addActivity: (activity) =>
        set((state) => ({
          activity: [
            {
              ...activity,
              id: `act-${Date.now()}`,
              at: new Date().toISOString(),
            },
            ...state.activity,
          ],
        })),
    }),
    {
      name: "petrotrade-seller-profile",
      partialize: (state) => ({ seller: state.seller }),
    },
  ),
);
