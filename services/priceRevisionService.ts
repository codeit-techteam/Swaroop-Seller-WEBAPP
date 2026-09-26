import { delay } from "@/lib/repositories/delay";

/**
 * Legacy mock delay used by sellerOpsStore workbench mutations.
 * Production Price Revision screen uses `@/services/price-revisions`.
 */
export async function updatePriceRevision<T>(value: T): Promise<T> {
  return delay(value, 280);
}

export {
  acceptSellerPriceRevision,
  counterSellerPriceRevision,
  fetchSellerPriceRevision,
  fetchSellerPriceRevisionsPage,
  fetchSellerPriceRevisionSummary,
  priceRevisionApiError,
  rejectSellerPriceRevision,
} from "./price-revisions";
