import { sellerNotificationsMock } from "@/lib/mock/notifications";
import { delay } from "@/services/mock";

export const notificationService = {
  async list() {
    return delay(sellerNotificationsMock);
  },
};
