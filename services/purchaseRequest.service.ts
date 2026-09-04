import { sellerRequestsMock } from "@/lib/mock/requests";
import { delay } from "@/services/mock";

export const purchaseRequestService = {
  async list() {
    return delay(sellerRequestsMock);
  },
};
