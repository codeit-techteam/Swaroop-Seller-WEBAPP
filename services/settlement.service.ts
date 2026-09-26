import {
  fetchSellerSettlement,
  fetchSellerSettlementsPage,
} from "@/services/settlements";

export const settlementService = {
  async list() {
    const page = await fetchSellerSettlementsPage({ page: 1, limit: 100 });
    return page.items;
  },
  async getById(id: string) {
    return fetchSellerSettlement(id);
  },
};
