/**
 * Legacy delay helpers used by the mock sellerOpsStore / workbench.
 * Production Vehicle Slots UI uses `@/services/vehicle-slots` instead.
 */
function delay<T>(value: T, ms = 220): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), ms);
  });
}

export async function getVehicleSlots<T>(slots: T): Promise<T> {
  return delay(slots, 220);
}

export async function bookVehicleSlot<T>(value: T): Promise<T> {
  return delay(value, 320);
}
