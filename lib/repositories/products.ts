import { sellerProductsMock } from "@/lib/mock/products";
import { delay } from "@/lib/repositories/delay";
import type { SellerProduct } from "@/types/seller";

export async function getProducts(): Promise<SellerProduct[]> {
  return delay(sellerProductsMock);
}

export async function getProductsByLocation(
  locationId: string,
): Promise<SellerProduct[]> {
  const products = await getProducts();
  return products.filter((item) => item.locationId === locationId);
}

export async function getProductById(
  id: string,
): Promise<SellerProduct | undefined> {
  const products = await getProducts();
  return products.find((item) => item.id === id);
}
