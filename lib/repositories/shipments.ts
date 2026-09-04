import { sellerShipmentsMock } from "@/lib/mock/shipments";
import { delay } from "@/lib/repositories/delay";
import { isInTransitTab } from "@/lib/seller/shipment-timeline";
import type { SellerShipment, ShipmentTab } from "@/types/seller";

export async function getShipments(): Promise<SellerShipment[]> {
  return delay(sellerShipmentsMock);
}

export async function getShipmentById(
  id: string,
): Promise<SellerShipment | undefined> {
  const shipments = await getShipments();
  const needle = id.trim().toLowerCase();
  return shipments.find(
    (item) =>
      item.id.toLowerCase() === needle || item.orderId.toLowerCase() === needle,
  );
}

export async function getShipmentsByLocation(
  locationId: string,
  tab?: ShipmentTab,
): Promise<SellerShipment[]> {
  const shipments = await getShipments();
  return shipments.filter((item) => {
    if (item.locationId !== locationId) return false;
    if (item.status === "CANCELLED") return false;
    if (!tab) return true;
    if (tab === "DELIVERED") return item.status === "DELIVERED";
    return isInTransitTab(item.status);
  });
}
