import { sellerProductsMock } from "@/lib/mock/products";
import { delay } from "@/services/mock";

export const productService = {
  async list() {
    return delay(sellerProductsMock);
  },
  async getById(id: string) {
    return delay(sellerProductsMock.find((item) => item.id === id) ?? null);
  },
};
