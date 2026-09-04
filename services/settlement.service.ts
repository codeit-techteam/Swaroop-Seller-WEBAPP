import {
  getPayments,
  getSettlementById,
  getSettlements,
} from "@/lib/repositories/settlements";

export const settlementService = {
  async list() {
    return getSettlements();
  },
  async getById(id: string) {
    return getSettlementById(id);
  },
  async payments() {
    return getPayments();
  },
};
