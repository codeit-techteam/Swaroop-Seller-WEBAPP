import { sellerOffersMock } from "@/lib/mock/offers";
import { delay } from "@/lib/repositories/delay";
import type { SellerOffer } from "@/types/seller";

export async function getOffers(): Promise<SellerOffer[]> {
  return delay(sellerOffersMock);
}

export async function getOffersByLocation(
  locationId: string,
): Promise<SellerOffer[]> {
  const offers = await getOffers();
  return offers.filter((item) => item.locationId === locationId);
}
