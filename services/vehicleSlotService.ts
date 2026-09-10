import { delay } from "@/lib/repositories/delay";
import type { VehicleSlot } from "@/types/seller-ops";

export async function getVehicleSlots(slots: VehicleSlot[]): Promise<VehicleSlot[]> {
  return delay(slots, 220);
}

export async function bookVehicleSlot<T>(value: T): Promise<T> {
  return delay(value, 320);
}
