import { fetchSellerOrders } from "@/services/commerce";
import { useLocationStore } from "@/store/locationStore";

export const orderService = {
  async list() {
    const locationId = useLocationStore.getState().selectedLocationId ?? "";
    return fetchSellerOrders(locationId);
  },
  async getById(id: string) {
    const items = await this.list();
    return items.find((item) => item.id === id);
  },
};
