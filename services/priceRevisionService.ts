import { delay } from "@/lib/repositories/delay";
import type { PriceRevision } from "@/types/seller-ops";

export async function getPriceRevisions(
  revisions: PriceRevision[],
): Promise<PriceRevision[]> {
  return delay(revisions, 220);
}

export async function updatePriceRevision<T>(value: T): Promise<T> {
  return delay(value, 280);
}
