import { formatCurrency, formatNumber } from "@/lib/utils";

export function formatInrShort(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_00_00_000) {
    return `${sign}₹${(abs / 1_00_00_000).toFixed(1)}Cr`;
  }
  if (abs >= 1_00_000) {
    return `${sign}₹${(abs / 1_00_000).toFixed(1)}L`;
  }
  return `${sign}${formatCurrency(abs, { currency: "INR" }).replace(/\.00$/, "")}`;
}

export function formatPricePerKg(value: number): string {
  const formatted = Number.isInteger(value)
    ? value.toString()
    : value.toFixed(1);
  return `₹${formatted}/kg`;
}

export function formatMt(value: number): string {
  return `${formatNumber(value)} MT`;
}

export function greetingForHour(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function availableToSell(
  available: number,
  reserved: number,
  committed: number,
): number {
  return Math.max(available - reserved - committed, 0);
}

export function hoursLeft(validUntil: string): number {
  const diff = new Date(validUntil).getTime() - Date.now();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60)));
}

export function slabsOverlap(
  slabs: { minQty: number; maxQty: number | null }[],
): boolean {
  const normalized = slabs
    .map((slab) => ({
      min: slab.minQty,
      max: slab.maxQty ?? Number.POSITIVE_INFINITY,
    }))
    .sort((a, b) => a.min - b.min);

  for (let index = 1; index < normalized.length; index += 1) {
    const prev = normalized[index - 1];
    const current = normalized[index];
    if (!prev || !current) continue;
    if (current.min <= prev.max) return true;
  }
  return false;
}
