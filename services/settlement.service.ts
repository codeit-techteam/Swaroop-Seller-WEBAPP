import { fetchSellerPayments, fetchSellerSettlements } from "@/services/commerce";

export const settlementService = {
  async list() {
    return fetchSellerSettlements();
  },
  async getById(id: string) {
    const items = await fetchSellerSettlements();
    return items.find((item) => item.id === id);
  },
  async payments() {
    return fetchSellerPayments();
  },
};
