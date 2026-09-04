import { getOrderById, getOrders } from "@/lib/repositories/orders";

export const orderService = {
  async list() {
    return getOrders();
  },
  async getById(id: string) {
    return getOrderById(id);
  },
};
