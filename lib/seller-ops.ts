import { BLOCKED_TIME_SLOTS } from "@/lib/mock/seller-ops";
import { formatInrShort, formatPricePerKg } from "@/lib/seller/format";
import { formatPercentage } from "@/lib/utils";
import {
  type PriceRevision,
  TIME_SLOT_OPTIONS,
  type TimeSlotAvailability,
  type VehicleSlot,
} from "@/types/seller-ops";

export function kgValue(mt: number, pricePerKg: number): number {
  return mt * 1000 * pricePerKg;
}

export function priceDelta(original: number, next: number): {
  amount: number;
  percent: number;
} {
  const amount = next - original;
  const percent = original === 0 ? 0 : (amount / original) * 100;
  return { amount, percent };
}

export function formatDeltaAmount(amount: number): string {
  const formatted = formatPricePerKg(Math.abs(amount));
  if (amount === 0) return formatted;
  return `${amount > 0 ? "+" : "-"}${formatted}`;
}

export function formatDeltaPercent(percent: number): string {
  const label = formatPercentage(Math.abs(percent), 2);
  if (percent === 0) return label;
  return `${percent > 0 ? "+" : "-"}${label}`;
}

export function formatOpsValue(value: number): string {
  return formatInrShort(value);
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function todayIsoDate(): string {
  return "2026-09-10";
}

export function nextSlotId(existing: VehicleSlot[]): string {
  const max = existing.reduce((acc, slot) => {
    const match = slot.id.match(/(\d+)$/);
    return match ? Math.max(acc, Number(match[1])) : acc;
  }, 8000);
  return `VS-2026-${String(max + 1).padStart(5, "0")}`;
}

export function orderIdForPr(purchaseRequestId: string): string {
  if (purchaseRequestId === "PR-2026-00982") return "ORD-2026-1018";
  return `ORD-${purchaseRequestId.replace("PR-", "")}`;
}

export function poNumberForPr(purchaseRequestId: string): string {
  return `PO-${purchaseRequestId.replace("PR-", "")}`;
}

const SLOT_CAPACITY = 2;

export function timeSlotAvailability(
  warehouseId: string,
  date: string,
  timeSlot: string,
  slots: VehicleSlot[],
): TimeSlotAvailability {
  const blockedKey = `${warehouseId}|${date}`;
  if (BLOCKED_TIME_SLOTS[blockedKey]?.includes(timeSlot)) return "BLOCKED";

  const booked = slots.filter(
    (slot) =>
      slot.warehouseId === warehouseId &&
      slot.date === date &&
      slot.timeSlot === timeSlot &&
      slot.status !== "CANCELLED",
  ).length;

  if (booked >= SLOT_CAPACITY) return "FULL";
  if (booked > 0) return "BOOKED";
  return "AVAILABLE";
}

export function slotGridFor(
  warehouseId: string,
  date: string,
  slots: VehicleSlot[],
): { timeSlot: string; availability: TimeSlotAvailability; count: number }[] {
  return TIME_SLOT_OPTIONS.map((timeSlot) => ({
    timeSlot,
    availability: timeSlotAvailability(warehouseId, date, timeSlot, slots),
    count: slots.filter(
      (slot) =>
        slot.warehouseId === warehouseId &&
        slot.date === date &&
        slot.timeSlot === timeSlot &&
        slot.status !== "CANCELLED",
    ).length,
  }));
}

export function canBookTimeSlot(availability: TimeSlotAvailability): boolean {
  return availability === "AVAILABLE" || availability === "BOOKED";
}

export function isPriceRevisionActionable(status: PriceRevision["status"]): boolean {
  return status === "PENDING" || status === "AWAITING_RESPONSE";
}

export function csvEscape(value: string | number): string {
  const text = String(value);
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}
