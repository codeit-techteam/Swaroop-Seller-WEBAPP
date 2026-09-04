import { sellerDocumentsMock } from "@/lib/mock/settlements";
import { delay } from "@/services/mock";

export const documentService = {
  async list() {
    return delay(sellerDocumentsMock);
  },
};
