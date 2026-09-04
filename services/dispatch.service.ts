import { sellerDispatchesMock } from "@/lib/mock/orders";
import { sellerShipmentsMock } from "@/lib/mock/shipments";
import { delay } from "@/lib/repositories/delay";

export const dispatchService = {
  async list() {
    return delay(sellerDispatchesMock);
  },
  async shipments() {
    return delay(sellerShipmentsMock);
  },
};
