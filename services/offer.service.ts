import { sellerOffersMock } from "@/lib/mock/offers";
import { delay } from "@/services/mock";

export const offerService = {
  async list() {
    return delay(sellerOffersMock);
  },
};
