import { fetchSellerOrderById, fetchSellerOrders } from "@/services/commerce";
import type { SellerOrder } from "@/types/seller";

export async function getOrders(): Promise<SellerOrder[]> {
  return fetchSellerOrders({ page: 1, limit: 100 });
}

export async function getOrderById(
  id: string,
): Promise<SellerOrder | undefined> {
  try {
    return await fetchSellerOrderById(id);
  } catch {
    return undefined;
  }
}

export async function getOrdersByLocation(
  _locationId: string,
): Promise<SellerOrder[]> {
  // PurchaseOrders are seller-org scoped (JWT), not warehouse-location scoped.
  return getOrders();
}
