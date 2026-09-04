import { sellerLocationsMock, sellerProfileMock } from "@/lib/mock/locations";
import { delay } from "@/services/mock";

export const sellerService = {
  async getProfile() {
    return delay(sellerProfileMock);
  },
  async getLocations() {
    return delay(sellerLocationsMock);
  },
};
