/**
 * @deprecated Prefer `@/services/seller-dispatches` for production Dispatch UI.
 * Kept for legacy store hydration via commerce.
 */
import {
  fetchSellerDispatchesPage,
  fetchSellerDispatchSummary,
} from "@/services/seller-dispatches";
import { useLocationStore } from "@/store/locationStore";

export const dispatchService = {
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    tab?: "all" | "ready" | "scheduled" | "loading" | "dispatched";
  }) {
    void useLocationStore.getState().selectedLocationId;
    return fetchSellerDispatchesPage({
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      search: params?.search,
      tab: params?.tab ?? "all",
    });
  },
  async summary() {
    return fetchSellerDispatchSummary();
  },
};
