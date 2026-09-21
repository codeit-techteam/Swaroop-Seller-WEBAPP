export const PETROTRADE_CREDIT_LABEL = "Credit — PetroTrade Managed";

export const PETROTRADE_CREDIT_NOTE =
  "Customer credit eligibility and payment terms are determined by PetroTrade.";

const CREDIT_PAYMENT_IDS = new Set([
  "credit",
  "credit_15",
  "credit_30",
  "credit_15_days",
  "credit_30_days",
  "CREDIT",
  "CREDIT_15",
  "CREDIT_30",
]);

export function isPlatformCreditPayment(value?: string | null): boolean {
  if (!value) return false;
  return CREDIT_PAYMENT_IDS.has(value) || value.toLowerCase().includes("credit");
}

export function sellerPaymentMethodLabel(value?: string | null): string {
  if (!value) return "—";
  if (isPlatformCreditPayment(value)) return PETROTRADE_CREDIT_LABEL;
  if (value === "advance" || value === "advance_payment") return "Advance";
  if (value === "on_loading") return "On Loading";
  if (value === "on_delivery") return "On Delivery";
  return value;
}

type LegacyPaymentPricing = {
  sellingPrice?: number;
  advance?: number;
  onLoading?: number;
  onDelivery?: number;
  credit15Days?: number;
  credit30Days?: number;
};

export function getSellingPrice(product: {
  basePrice?: number;
  paymentPricing?: LegacyPaymentPricing | null;
}): number {
  const value =
    product.basePrice ??
    product.paymentPricing?.sellingPrice ??
    product.paymentPricing?.advance ??
    0;
  return Number.isFinite(value) && value > 0 ? value : 0;
}
