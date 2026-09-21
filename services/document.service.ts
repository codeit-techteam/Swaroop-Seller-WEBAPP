import { fetchSellerDocuments } from "@/services/commerce";

export const documentService = {
  async list() {
    return fetchSellerDocuments();
  },
};
