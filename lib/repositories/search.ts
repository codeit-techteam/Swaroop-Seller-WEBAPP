import { ROUTES } from "@/lib/constants";
import { sellerOffersMock } from "@/lib/mock/offers";
import { sellerOrdersMock } from "@/lib/mock/orders";
import { sellerProductsMock } from "@/lib/mock/products";
import { sellerRequestsMock } from "@/lib/mock/requests";
import { sellerSettlementsMock } from "@/lib/mock/settlements";
import { sellerShipmentsMock } from "@/lib/mock/shipments";
import { delay } from "@/lib/repositories/delay";

export type SellerSearchCategory =
  "Grade" | "Offer" | "Purchase Request" | "Order" | "Shipment" | "Settlement";

export interface SellerSearchHit {
  id: string;
  category: SellerSearchCategory;
  title: string;
  subtitle: string;
  href: string;
}

function matches(query: string, ...parts: string[]): boolean {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return false;
  return parts.some((part) => part.toLowerCase().includes(needle));
}

export async function searchSellerRecords(
  query: string,
): Promise<SellerSearchHit[]> {
  const hits: SellerSearchHit[] = [
    ...sellerProductsMock
      .filter((item) =>
        matches(query, item.gradeName, item.category, item.manufacturer),
      )
      .map((item) => ({
        id: item.id,
        category: "Grade" as const,
        title: item.gradeName,
        subtitle: `${item.category} · ${item.manufacturer}`,
        href: `${ROUTES.PRODUCTS}/${item.id}`,
      })),
    ...sellerOffersMock
      .filter((item) => matches(query, item.gradeName, item.category, item.id))
      .map((item) => ({
        id: item.id,
        category: "Offer" as const,
        title: item.gradeName,
        subtitle: `₹${item.price}/kg · ${item.status}`,
        href: `${ROUTES.OFFERS}/${item.id}`,
      })),
    ...sellerRequestsMock
      .filter((item) =>
        matches(query, item.requestNumber, item.gradeName, item.buyerId),
      )
      .map((item) => ({
        id: item.id,
        category: "Purchase Request" as const,
        title: item.requestNumber,
        subtitle: `${item.gradeName} · ${item.quantityMt} MT`,
        href: `${ROUTES.PURCHASE_REQUESTS}/${item.id}`,
      })),
    ...sellerOrdersMock
      .filter((item) =>
        matches(query, item.orderId, item.gradeName, item.buyerRef),
      )
      .map((item) => ({
        id: item.id,
        category: "Order" as const,
        title: item.orderId,
        subtitle: `${item.gradeName} · ${item.quantityMt} MT`,
        href: `${ROUTES.ORDERS}/${item.orderId}`,
      })),
    ...sellerShipmentsMock
      .filter((item) =>
        matches(
          query,
          item.id,
          item.orderId,
          item.grade,
          item.vehicleNumber,
          item.route,
        ),
      )
      .map((item) => ({
        id: item.id,
        category: "Shipment" as const,
        title: item.id,
        subtitle: `${item.orderId} · ${item.grade}`,
        href: `${ROUTES.SHIPMENTS}/${item.id}`,
      })),
    ...sellerSettlementsMock
      .filter((item) =>
        matches(
          query,
          item.settlementId,
          item.orderId,
          item.buyerRef,
          item.invoiceRef,
        ),
      )
      .map((item) => ({
        id: item.id,
        category: "Settlement" as const,
        title: item.settlementId,
        subtitle: `${item.orderId} · ${item.invoiceRef}`,
        href: ROUTES.SETTLEMENTS,
      })),
  ];

  return delay(hits, 80);
}
