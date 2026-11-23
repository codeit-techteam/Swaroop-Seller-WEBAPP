/** Matches backend COMMERCE_FREIGHT_PER_MT default — live listings require ≥ this ₹/MT. */
export const MARKETPLACE_FREIGHT_FLOOR_PER_MT = 1250;

export function needsMarketplacePriceReview(pricePerMt: number): boolean {
  return (
    Number.isFinite(pricePerMt) &&
    pricePerMt > 0 &&
    pricePerMt < MARKETPLACE_FREIGHT_FLOOR_PER_MT
  );
}

export function marketplacePriceReviewMessage(pricePerMt: number): string {
  return `Material price ₹${pricePerMt.toLocaleString("en-IN")}/MT is below platform freight (₹${MARKETPLACE_FREIGHT_FLOOR_PER_MT.toLocaleString("en-IN")}/MT). Enter a realistic ₹/MT selling price before publishing — otherwise Customer App/Web Live Listings will not show this grade.`;
}
