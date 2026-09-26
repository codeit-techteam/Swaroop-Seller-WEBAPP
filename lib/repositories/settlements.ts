import {
  fetchSellerPayments,
  fetchSellerSettlements,
} from "@/services/commerce";
import { fetchSellerSettlement } from "@/services/settlements";
import type { SellerPayment, SellerSettlement } from "@/types/seller";

export async function getSettlements(): Promise<SellerSettlement[]> {
  return fetchSellerSettlements();
}

export async function getSettlementById(
  id: string,
): Promise<SellerSettlement | undefined> {
  try {
    const detail = await fetchSellerSettlement(id);
    return {
      id: detail.id,
      settlementId: detail.settlementNumber,
      orderId:
        detail.orderNumber ??
        detail.purchaseOrderId ??
        detail.orderId ??
        detail.id,
      buyerRef: detail.buyer.displayName,
      amount: detail.netAmount,
      grossAmount: detail.grossAmount,
      gstAmount: detail.taxAmount,
      commission: detail.platformFee,
      otherDeductions: detail.otherDeductions,
      deductions: detail.deductions,
      invoiceDate: detail.createdAt,
      settlementDate: detail.settlementDate ?? detail.releasedAt ?? undefined,
      paymentDate: detail.relatedPayment?.paidAt ?? undefined,
      paymentReference: detail.relatedPayment?.referenceNumber,
      status:
        detail.status === "RELEASED"
          ? "settled"
          : detail.status === "PROCESSING" || detail.status === "READY"
            ? "processing"
            : detail.status === "ON_HOLD" ||
                detail.status === "FAILED" ||
                detail.status === "CANCELLED"
              ? "on_hold"
              : "pending",
      invoiceRef: detail.invoiceNumber ?? detail.proformaInvoiceNumber ?? "—",
      timeline: detail.timeline.map((event) => ({
        id: event.id,
        label: event.label,
        status: event.status,
        at: event.at || undefined,
      })),
    };
  } catch {
    const settlements = await getSettlements();
    const needle = id.trim().toLowerCase();
    return settlements.find(
      (item) =>
        item.id.toLowerCase() === needle ||
        item.settlementId.toLowerCase() === needle,
    );
  }
}

export async function getPayments(): Promise<SellerPayment[]> {
  return fetchSellerPayments();
}
