import { cloneSellerOpsBundle } from "@/lib/mock/seller-ops";
import { delay } from "@/lib/repositories/delay";
import type { SellerOpsBundle } from "@/types/seller-ops";

export async function getSellerOpsBundle(): Promise<SellerOpsBundle> {
  return delay(cloneSellerOpsBundle(), 420);
}

export async function getPriceRevisions() {
  const bundle = await getSellerOpsBundle();
  return bundle.priceRevisions;
}

export async function getVehicleSlots() {
  const bundle = await getSellerOpsBundle();
  return bundle.vehicleSlots;
}

export async function getProcurementRecords() {
  const bundle = await getSellerOpsBundle();
  return bundle.procurementRecords;
}
