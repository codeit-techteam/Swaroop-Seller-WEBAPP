import {
  fetchSellerDocuments,
  getSellerDocumentDownloadUrl,
  getSellerDocumentPreviewUrl,
} from "@/services/seller-documents";

export const documentService = {
  async list() {
    return fetchSellerDocuments();
  },
  async download(id: string) {
    return getSellerDocumentDownloadUrl(id);
  },
  async preview(id: string) {
    return getSellerDocumentPreviewUrl(id);
  },
};
