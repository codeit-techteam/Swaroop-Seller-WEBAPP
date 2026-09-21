import { fetchSellerDispatches, fetchSellerShipments } from "@/services/commerce";
import { useLocationStore } from "@/store/locationStore";

export const dispatchService = {
  async list() {
    const locationId = useLocationStore.getState().selectedLocationId ?? "";
    return fetchSellerDispatches(locationId);
  },
  async shipments() {
    const locationId = useLocationStore.getState().selectedLocationId ?? "";
    return fetchSellerShipments(locationId);
  },
};
