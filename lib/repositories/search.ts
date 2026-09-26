import { getVisibleNavSections } from "@/config/navigation";
import { ROUTES } from "@/lib/constants";
import { fetchSellerProducts } from "@/services/catalog";
import {
  fetchSellerOffers,
  fetchSellerOrders,
  fetchSellerPayments,
  fetchSellerPurchaseRequests,
  fetchSellerSettlements,
  fetchSellerShipments,
} from "@/services/commerce";
import { fetchSellerInventory } from "@/services/inventory";
import { fetchSellerPriceRevisionsPage } from "@/services/price-revisions";
import { fetchSellerProcurementWorkbench } from "@/services/procurementService";
import { fetchSellerDispatchesPage } from "@/services/seller-dispatches";
import { fetchSellerDocuments } from "@/services/seller-documents";
import { fetchVehicleSlotsPage } from "@/services/vehicle-slots";
import { useLocationStore } from "@/store/locationStore";

export type SellerSearchCategory =
  | "Page"
  | "Product"
  | "Inventory"
  | "Offer"
  | "Purchase Request"
  | "Order"
  | "Dispatch"
  | "Vehicle Slot"
  | "Shipment"
  | "Settlement"
  | "Payment"
  | "Price Revision"
  | "Workbench"
  | "Document";

export interface SellerSearchHit {
  id: string;
  category: SellerSearchCategory;
  title: string;
  subtitle: string;
  href: string;
}

const CATEGORY_ORDER: SellerSearchCategory[] = [
  "Page",
  "Product",
  "Inventory",
  "Offer",
  "Purchase Request",
  "Order",
  "Dispatch",
  "Vehicle Slot",
  "Shipment",
  "Settlement",
  "Payment",
  "Price Revision",
  "Workbench",
  "Document",
];

const PER_CATEGORY_LIMIT = 5;
const TOTAL_LIMIT = 40;

function matches(
  query: string,
  ...parts: Array<string | null | undefined>
): boolean {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return false;
  return parts.some((part) =>
    Boolean(part && String(part).toLowerCase().includes(needle)),
  );
}

function settled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

function pageHits(query: string): SellerSearchHit[] {
  const sections = getVisibleNavSections("SELLER");
  const pages = sections.flatMap((section) =>
    section.items.map((item) => ({
      id: `page-${item.href}`,
      category: "Page" as const,
      title: item.label,
      subtitle: section.title ? `${section.title} · ${item.href}` : item.href,
      href: item.href,
      keywords: [
        item.label,
        section.title ?? "",
        item.href.replaceAll("/", " "),
      ],
    })),
  );

  // Extra deep-links that sellers commonly search by name.
  const extras: Array<{
    id: string;
    title: string;
    subtitle: string;
    href: string;
    keywords: string[];
  }> = [
    {
      id: "page-create-offer",
      title: "Create Offer",
      subtitle: "Marketplace · New offer",
      href: ROUTES.OFFERS_NEW,
      keywords: ["create offer", "new offer", "add offer"],
    },
    {
      id: "page-add-product",
      title: "Add Product",
      subtitle: "Marketplace · New grade listing",
      href: ROUTES.PRODUCTS_NEW,
      keywords: ["add product", "new product", "add grade"],
    },
    {
      id: "page-notifications",
      title: "Notifications",
      subtitle: "Account · Alerts",
      href: ROUTES.NOTIFICATIONS,
      keywords: ["notifications", "alerts", "bell"],
    },
    {
      id: "page-settings",
      title: "Settings",
      subtitle: "Account · Preferences",
      href: ROUTES.SETTINGS,
      keywords: ["settings", "preferences"],
    },
  ];

  return [
    ...pages
      .filter((page) => matches(query, ...page.keywords))
      .map(({ keywords: _keywords, ...hit }) => hit),
    ...extras
      .filter((page) => matches(query, page.title, ...page.keywords))
      .map((page) => ({
        id: page.id,
        category: "Page" as const,
        title: page.title,
        subtitle: page.subtitle,
        href: page.href,
      })),
  ];
}

function rankHits(hits: SellerSearchHit[]): SellerSearchHit[] {
  const byCategory = new Map<SellerSearchCategory, SellerSearchHit[]>();
  for (const hit of hits) {
    const list = byCategory.get(hit.category) ?? [];
    if (list.length < PER_CATEGORY_LIMIT) {
      list.push(hit);
      byCategory.set(hit.category, list);
    }
  }

  const ranked: SellerSearchHit[] = [];
  for (const category of CATEGORY_ORDER) {
    ranked.push(...(byCategory.get(category) ?? []));
  }
  return ranked.slice(0, TOTAL_LIMIT);
}

/**
 * Universal Seller ERP search — pages + live records across marketplace,
 * orders, logistics, finance, procurement, and compliance modules.
 */
export async function searchSellerRecords(
  query: string,
): Promise<SellerSearchHit[]> {
  const needle = query.trim();
  if (needle.length < 2) return [];

  const locationId =
    useLocationStore.getState().selectedLocationId ||
    useLocationStore.getState().locations[0]?.id ||
    "";

  const [
    productsResult,
    inventoryResult,
    offersResult,
    requestsResult,
    ordersResult,
    dispatchesResult,
    slotsResult,
    shipmentsResult,
    settlementsResult,
    paymentsResult,
    revisionsResult,
    workbenchResult,
    documentsResult,
  ] = await Promise.allSettled([
    fetchSellerProducts(),
    fetchSellerInventory({ page: 1, limit: 50, search: needle }),
    fetchSellerOffers({ page: 1, limit: 50, search: needle }),
    fetchSellerPurchaseRequests(locationId),
    fetchSellerOrders({ page: 1, limit: 50, search: needle }),
    fetchSellerDispatchesPage({ page: 1, limit: 50, search: needle }),
    fetchVehicleSlotsPage({ page: 1, limit: 50, search: needle }),
    fetchSellerShipments(locationId),
    fetchSellerSettlements(),
    fetchSellerPayments(),
    fetchSellerPriceRevisionsPage({ page: 1, limit: 50, search: needle }),
    fetchSellerProcurementWorkbench({ page: 1, limit: 50, search: needle }),
    fetchSellerDocuments(),
  ]);

  const products = settled(productsResult, []);
  const inventory = settled(inventoryResult, { items: [], meta: {} }).items;
  const offers = settled(offersResult, []);
  const requests = settled(requestsResult, []);
  const orders = settled(ordersResult, []);
  const dispatches = settled(dispatchesResult, {
    items: [],
    pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
  }).items;
  const slots = settled(slotsResult, {
    items: [],
    pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
  }).items;
  const shipments = settled(shipmentsResult, []);
  const settlements = settled(settlementsResult, []);
  const payments = settled(paymentsResult, []);
  const revisions = settled(revisionsResult, {
    items: [],
    meta: { page: 1, limit: 50, total: 0, totalPages: 1 },
  }).items;
  const workbench = settled(workbenchResult, {
    items: [],
    meta: { page: 1, limit: 50, total: 0, totalPages: 1 },
  }).items;
  const documents = settled(documentsResult, []);

  const hits: SellerSearchHit[] = [
    ...pageHits(needle),

    ...products
      .filter((item) =>
        matches(
          needle,
          item.gradeName,
          item.gradeCode,
          item.category,
          item.manufacturer,
          item.id,
        ),
      )
      .map((item) => ({
        id: item.id,
        category: "Product" as const,
        title: item.gradeName,
        subtitle: `${item.category} · ${item.manufacturer}`,
        href: `${ROUTES.PRODUCTS}/${item.id}`,
      })),

    ...inventory
      .filter((item) =>
        matches(
          needle,
          item.gradeName,
          item.gradeCode,
          item.category,
          item.warehouseName,
          item.warehouseCity,
          item.id,
        ),
      )
      .map((item) => ({
        id: item.id,
        category: "Inventory" as const,
        title: item.gradeName,
        subtitle: `${item.warehouseName} · ${item.sellableQuantity} ${item.unit} sellable`,
        href: ROUTES.INVENTORY,
      })),

    ...offers
      .filter((item) =>
        matches(
          needle,
          item.gradeName,
          item.category,
          item.referenceNumber,
          item.id,
          item.warehouseName,
        ),
      )
      .map((item) => ({
        id: item.id,
        category: "Offer" as const,
        title: item.referenceNumber || item.gradeName,
        subtitle: `${item.gradeName} · ₹${item.price}/${item.unit} · ${item.status}`,
        href: `${ROUTES.OFFERS}/${item.id}`,
      })),

    ...requests
      .filter((item) =>
        matches(
          needle,
          item.requestNumber,
          item.gradeName,
          item.buyerLabel,
          item.buyerId,
          item.id,
        ),
      )
      .map((item) => ({
        id: item.id,
        category: "Purchase Request" as const,
        title: item.requestNumber,
        subtitle: `${item.gradeName} · ${item.quantityMt} MT · ${item.status}`,
        href: `${ROUTES.PURCHASE_REQUESTS}/${item.id}`,
      })),

    ...orders
      .filter((item) =>
        matches(needle, item.orderId, item.gradeName, item.buyerRef, item.id),
      )
      .map((item) => ({
        id: item.id,
        category: "Order" as const,
        title: item.orderId,
        subtitle: `${item.gradeName} · ${item.quantityMt} MT`,
        href: `${ROUTES.ORDERS}/${item.id}`,
      })),

    ...dispatches
      .filter((item) =>
        matches(
          needle,
          item.dispatchNumber,
          item.purchaseOrderReference,
          item.gradeName,
          item.vehicleNumber,
          item.buyer.displayName,
          item.id,
        ),
      )
      .map((item) => ({
        id: item.id,
        category: "Dispatch" as const,
        title: item.dispatchNumber,
        subtitle: `${item.gradeName ?? "Dispatch"} · ${item.status}`,
        href: `${ROUTES.DISPATCH}/${item.id}`,
      })),

    ...slots
      .filter((item) =>
        matches(
          needle,
          item.slotNumber,
          item.dispatchNumber,
          item.purchaseOrderReference,
          item.vehicleNumber,
          item.warehouseName,
          item.id,
        ),
      )
      .map((item) => ({
        id: item.id,
        category: "Vehicle Slot" as const,
        title: item.slotNumber || item.id,
        subtitle: `${item.warehouseName ?? "Warehouse"} · ${item.slotDate} · ${item.status}`,
        href: ROUTES.VEHICLE_SLOTS,
      })),

    ...shipments
      .filter((item) =>
        matches(
          needle,
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
        subtitle: `${item.orderId} · ${item.grade} · ${item.vehicleNumber}`,
        href: `${ROUTES.SHIPMENTS}/${item.id}`,
      })),

    ...settlements
      .filter((item) =>
        matches(
          needle,
          item.settlementId,
          item.orderId,
          item.buyerRef,
          item.invoiceRef,
          item.id,
        ),
      )
      .map((item) => ({
        id: item.id,
        category: "Settlement" as const,
        title: item.settlementId,
        subtitle: `${item.orderId} · ${item.invoiceRef ?? "Settlement"}`,
        href: `${ROUTES.SETTLEMENTS}/${item.id}`,
      })),

    ...payments
      .filter((item) =>
        matches(
          needle,
          item.paymentId,
          item.orderId,
          item.buyerRef,
          item.reference,
          item.id,
        ),
      )
      .map((item) => ({
        id: item.id,
        category: "Payment" as const,
        title: item.paymentId,
        subtitle: `${item.orderId} · ₹${item.amount}`,
        href: `${ROUTES.PAYMENTS}/${item.id}`,
      })),

    ...revisions
      .filter((item) =>
        matches(
          needle,
          item.requestNumber,
          item.grade?.name,
          item.grade?.displayName,
          item.product?.name,
          item.orderReference,
          item.id,
        ),
      )
      .map((item) => ({
        id: item.id,
        category: "Price Revision" as const,
        title: item.requestNumber,
        subtitle: `${item.grade?.displayName ?? item.product?.name ?? "Revision"} · ${item.status}`,
        href: ROUTES.PRICE_REVISIONS,
      })),

    ...workbench
      .filter((item) =>
        matches(
          needle,
          item.purchaseRequestId,
          item.orderId,
          item.gradeName,
          item.productName,
          item.buyerDisplayName,
          item.id,
        ),
      )
      .map((item) => ({
        id: item.id,
        category: "Workbench" as const,
        title: item.orderId || item.purchaseRequestId,
        subtitle: `${item.gradeName} · ${item.currentStage}`,
        href: ROUTES.PROCUREMENT_WORKBENCH,
      })),

    ...documents
      .filter((item) =>
        matches(
          needle,
          item.name,
          item.fileName,
          item.category,
          item.documentNumber,
          item.id,
        ),
      )
      .map((item) => ({
        id: item.id,
        category: "Document" as const,
        title: item.name,
        subtitle: `${item.category} · ${item.status}`,
        href: `${ROUTES.DOCUMENTS}/${item.id}`,
      })),
  ];

  return rankHits(hits);
}
