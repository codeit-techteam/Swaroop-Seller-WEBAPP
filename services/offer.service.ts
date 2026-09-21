import { fetchSellerOffers } from "@/services/commerce";
import { useLocationStore } from "@/store/locationStore";

export const offerService = {
  async list() {
    const locationId = useLocationStore.getState().selectedLocationId ?? "";
    return fetchSellerOffers(locationId);
  },
};
