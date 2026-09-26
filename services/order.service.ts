import {
  fetchSellerOrderById,
  fetchSellerOrdersPage,
} from "@/services/commerce";

export const orderService = {
  async list(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    return fetchSellerOrdersPage(params);
  },
  async getById(id: string) {
    return fetchSellerOrderById(id);
  },
};
