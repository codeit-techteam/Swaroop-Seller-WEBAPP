import { sellerOrdersMock } from "@/lib/mock/orders";
import { delay } from "@/lib/repositories/delay";
import type { SellerOrder } from "@/types/seller";

export async function getOrders(): Promise<SellerOrder[]> {
  return delay(sellerOrdersMock);
}

export async function getOrderById(
  id: string,
): Promise<SellerOrder | undefined> {
  const orders = await getOrders();
  const needle = id.trim().toLowerCase();
  return orders.find(
    (item) =>
      item.id.toLowerCase() === needle || item.orderId.toLowerCase() === needle,
  );
}

export async function getOrdersByLocation(
  locationId: string,
): Promise<SellerOrder[]> {
  const orders = await getOrders();
  return orders.filter((item) => item.locationId === locationId);
}
