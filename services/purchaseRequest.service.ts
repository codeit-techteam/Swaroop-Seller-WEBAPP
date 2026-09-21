import { fetchSellerPurchaseRequests } from "@/services/commerce";
import { useLocationStore } from "@/store/locationStore";

export const purchaseRequestService = {
  async list() {
    const locationId = useLocationStore.getState().selectedLocationId ?? "";
    return fetchSellerPurchaseRequests(locationId);
  },
};
