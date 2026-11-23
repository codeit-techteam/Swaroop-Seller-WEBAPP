/** Matches backend COMMERCE_FREIGHT_PER_MT default — live listings require ≥ this ₹/MT. */
export const MARKETPLACE_FREIGHT_FLOOR_PER_MT = 1250;

/** Polymer ₹/kg quotes rarely exceed this; used to detect ₹/kg typed into ₹/MT. */
const LIKELY_PER_KG_MAX = 500;

export function needsMarketplacePriceReview(pricePerMt: number): boolean {
  return (
    Number.isFinite(pricePerMt) &&
    pricePerMt > 0 &&
    pricePerMt < MARKETPLACE_FREIGHT_FLOOR_PER_MT
  );
}

/** True when the value looks like a ₹/kg polymer quote entered in the ₹/MT field. */
export function looksLikePricePerKg(price: number): boolean {
  return (
    Number.isFinite(price) &&
    price > 0 &&
    price <= LIKELY_PER_KG_MAX &&
    price < MARKETPLACE_FREIGHT_FLOOR_PER_MT
  );
}

export function convertPerKgToPerMt(pricePerKg: number): number {
  return pricePerKg * 1000;
}

/**
 * Mirrors backend normalizeMaterialPricePerMt — converts likely ₹/kg → ₹/MT.
 */
export function normalizeSellerPricePerMt(price: number): {
  pricePerMt: number;
  convertedFromPerKg: boolean;
  original: number;
} {
  if (!Number.isFinite(price) || price <= 0) {
    return { pricePerMt: price, convertedFromPerKg: false, original: price };
  }
  if (looksLikePricePerKg(price)) {
    return {
      pricePerMt: convertPerKgToPerMt(price),
      convertedFromPerKg: true,
      original: price,
    };
  }
  return { pricePerMt: price, convertedFromPerKg: false, original: price };
}

export function marketplacePriceReviewMessage(pricePerMt: number): string {
  if (looksLikePricePerKg(pricePerMt)) {
    const asMt = convertPerKgToPerMt(pricePerMt);
    return `₹${pricePerMt.toLocaleString("en-IN")} looks like ₹/kg. Use ₹${asMt.toLocaleString("en-IN")}/MT so Customer App/Web Live Listings can show this grade (live floor ₹${MARKETPLACE_FREIGHT_FLOOR_PER_MT.toLocaleString("en-IN")}/MT).`;
  }
  return `Material price ₹${pricePerMt.toLocaleString("en-IN")}/MT is below platform freight (₹${MARKETPLACE_FREIGHT_FLOOR_PER_MT.toLocaleString("en-IN")}/MT). Enter a realistic ₹/MT selling price before publishing — otherwise Customer App/Web Live Listings will not show this grade.`;
}
