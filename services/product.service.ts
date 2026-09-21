import { fetchSellerProducts } from "@/services/catalog";

export const productService = {
  async list() {
    return fetchSellerProducts();
  },
  async getById(id: string) {
    const products = await fetchSellerProducts();
    return products.find((item) => item.id === id) ?? null;
  },
};
