import { fetchSellerPayments, fetchSellerSettlements } from "@/services/commerce";
import type { SellerPayment, SellerSettlement } from "@/types/seller";

export async function getSettlements(): Promise<SellerSettlement[]> {
  return fetchSellerSettlements();
}

export async function getSettlementById(
  id: string,
): Promise<SellerSettlement | undefined> {
  const settlements = await getSettlements();
  const needle = id.trim().toLowerCase();
  return settlements.find(
    (item) =>
      item.id.toLowerCase() === needle ||
      item.settlementId.toLowerCase() === needle,
  );
}

export async function getPayments(): Promise<SellerPayment[]> {
  return fetchSellerPayments();
}
