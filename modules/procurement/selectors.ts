import type {
  ProcurementAttachment,
  ProcurementItem,
  ProcurementStage,
  ProcurementStatus,
  ProcurementSummary,
  SellerQueueStatus,
} from "@/types/procurement";
import { PROCUREMENT_STAGES } from "@/types/procurement";

export function normalizeStatus(status: ProcurementStatus): ProcurementStatus {
  if (status === "PENDING_APPROVAL") return "APPROVAL_PENDING";
  if (status === "PO_CREATED") return "CONVERTED_TO_PO";
  return status;
}

export function stageFromStatus(status: ProcurementStatus): ProcurementStage {
  switch (normalizeStatus(status)) {
    case "DRAFT":
    case "NEW":
      return "CREATED";
    case "UNDER_REVIEW":
      return "UNDER_REVIEW";
    case "SELLER_SOURCING":
      return "SELLER_SOURCING";
    case "QUOTATION_RECEIVED":
      return "QUOTATION";
    case "NEGOTIATION":
      return "NEGOTIATION";
    case "APPROVAL_PENDING":
    case "APPROVED":
      return "APPROVAL";
    case "CONVERTED_TO_PO":
      return "PO_CREATED";
    case "COMPLETED":
      return "COMPLETED";
    case "REJECTED":
    case "CANCELLED":
      return "CREATED";
    default:
      return "CREATED";
  }
}

export function sellerStatusFromItem(item: ProcurementItem): SellerQueueStatus {
  if (item.poId || item.type === "PO") return "PO_ISSUED";
  if (item.selectedSellerId) return "SELECTED";
  if (item.status === "NEGOTIATION") return "NEGOTIATING";
  if (item.offers.some((offer) => offer.status === "SUBMITTED" || offer.status === "PENDING")) {
    return "QUOTATION_RECEIVED";
  }
  if (item.assignedSellers?.length) return "RFQ_SENT";
  return "UNASSIGNED";
}

export function defaultDocuments(item: ProcurementItem): ProcurementAttachment[] {
  const at = item.createdAt;
  const docs: ProcurementAttachment[] = [
    {
      id: `${item.requestId}-pr`,
      name: `${item.requestId} customer PR.pdf`,
      kind: "CUSTOMER_PR",
      uploadedAt: at,
      visibleToSeller: false,
    },
  ];
  if (item.assignedSellers?.length) {
    docs.push({
      id: `${item.requestId}-rfq`,
      name: `RFQ ${item.requestId}.pdf`,
      kind: "RFQ",
      uploadedAt: at,
      visibleToSeller: true,
    });
  }
  if (item.offers.length) {
    docs.push({
      id: `${item.requestId}-quote`,
      name: "Supplier quotations.pdf",
      kind: "QUOTATION",
      uploadedAt: at,
      visibleToSeller: true,
    });
  }
  if (item.type === "PO" || item.poId) {
    docs.push({
      id: `${item.requestId}-po`,
      name: `${item.poId ?? item.id} purchase order.pdf`,
      kind: "PO",
      uploadedAt: at,
      visibleToSeller: true,
    });
  }
  return docs;
}

export function hydrateProcurementItem(item: ProcurementItem): ProcurementItem {
  const status = normalizeStatus(item.status);
  const assignedSellers =
    item.assignedSellers?.length
      ? item.assignedSellers
      : item.supplierId
        ? [
            {
              supplierId: item.supplierId,
              supplierName: item.supplier,
              rfqSentAt: item.createdAt,
            },
          ]
        : [];
  const offers = (item.offers ?? []).map((offer) => ({
    ...offer,
    availableQty: offer.availableQty ?? offer.quantity,
    deliveryDays: offer.deliveryDays ?? 7,
    creditTerms: offer.creditTerms ?? item.paymentTerms,
    validity: offer.validity ?? "7 days",
    compliance: offer.compliance ?? "VALID",
    rating: offer.rating ?? 4.4,
    submittedAt: offer.submittedAt ?? item.createdAt,
  }));
  const hydrated: ProcurementItem = {
    ...item,
    prId: item.prId ?? (item.type === "PO" ? item.requestId : item.id),
    poId: item.poId ?? (item.type === "PO" ? item.id : undefined),
    status,
    creditTerms: item.creditTerms || (item.creditRequired ? "Net 30" : "Advance"),
    deliveryCharges: item.deliveryCharges ?? 0,
    taxes: item.taxes ?? Math.round((item.negotiatedValue || item.estimatedCost) * 0.18),
    margin: item.margin ?? item.commission,
    assignedSellers,
    offers,
    documents: item.documents?.length ? item.documents : defaultDocuments({
      ...item,
      assignedSellers,
      offers,
    }),
    negotiationStatus:
      item.negotiationStatus ??
      (status === "NEGOTIATION"
        ? "ACTIVE"
        : item.negotiation?.length
          ? "COMPLETED"
          : "NONE"),
    sellerStatus: item.sellerStatus ?? "UNASSIGNED",
    poStatus:
      item.poStatus ??
      (item.type === "PO"
        ? status === "COMPLETED"
          ? "COMPLETED"
          : status === "APPROVED"
            ? "SENT_TO_SELLER"
            : "SELLER_REVIEW"
        : undefined),
    stage: item.stage,
  };
  return {
    ...hydrated,
    sellerStatus: sellerStatusFromItem(hydrated),
    stage: stageFromStatus(status),
  };
}

export function computeProcurementSummary(
  items: ProcurementItem[],
): ProcurementSummary {
  const prs = items.filter((item) => item.type === "PR");
  const pendingApprovals = items.filter(
    (item) =>
      item.status === "APPROVAL_PENDING" || item.status === "PENDING_APPROVAL",
  ).length;
  const activeNegotiations = items.filter(
    (item) => item.status === "NEGOTIATION",
  ).length;
  const openPoValue = items
    .filter(
      (item) =>
        item.type === "PO" ||
        item.status === "APPROVED" ||
        item.status === "CONVERTED_TO_PO" ||
        item.status === "COMPLETED",
    )
    .reduce((sum, item) => sum + (item.negotiatedValue || item.estimatedCost), 0);
  const averageProcessingHours = items.length
    ? Math.round(
        items.reduce((sum, item) => sum + item.processingHours, 0) /
          items.length,
      )
    : 0;
  const now = Date.now();

  return {
    pendingApprovals,
    averageProcessingHours,
    activeNegotiations,
    openPoValue,
    newRequests: prs.filter((item) => item.status === "NEW" || item.status === "DRAFT").length,
    underReview: prs.filter((item) => item.status === "UNDER_REVIEW").length,
    awaitingQuote: prs.filter((item) => item.status === "SELLER_SOURCING").length,
    overdue: items.filter(
      (item) =>
        item.delayed ||
        (item.expectedCompletion && new Date(item.expectedCompletion).getTime() < now &&
          item.status !== "COMPLETED" &&
          item.status !== "REJECTED"),
    ).length,
    pendingPrs: prs.filter(
      (item) => !["COMPLETED", "REJECTED", "CANCELLED"].includes(item.status),
    ).length,
    quotationPending: prs.filter((item) => item.status === "SELLER_SOURCING").length,
    poAwaitingSeller: items.filter(
      (item) =>
        item.type === "PO" &&
        (item.poStatus === "SENT_TO_SELLER" || item.poStatus === "SELLER_REVIEW"),
    ).length,
    dispatchPending: items.filter(
      (item) =>
        item.poStatus === "CONFIRMED" || item.poStatus === "READY_FOR_DISPATCH",
    ).length,
    completed: items.filter((item) => item.status === "COMPLETED").length,
  };
}

export function nextPrId(items: ProcurementItem[]): string {
  const numbers = items
    .map((item) => item.prId ?? item.requestId)
    .filter((id) => id.startsWith("PR-"))
    .map((id) => Number(id.replace("PR-", "")))
    .filter((value) => Number.isFinite(value));
  const max = numbers.length ? Math.max(...numbers) : 4400;
  return `PR-${max + 1}`;
}

export function nextPoId(items: ProcurementItem[]): string {
  const numbers = items
    .flatMap((item) => [item.poId, item.id, item.requestId])
    .filter((id): id is string => Boolean(id?.startsWith("PO-")))
    .map((id) => Number(id.replace("PO-", "")))
    .filter((value) => Number.isFinite(value));
  const max = numbers.length ? Math.max(...numbers) : 2290;
  return `PO-${max + 1}`;
}

export function findProcurementItem(
  items: ProcurementItem[],
  id: string,
): ProcurementItem | undefined {
  return items.find(
    (item) =>
      item.id === id ||
      item.requestId === id ||
      item.prId === id ||
      item.poId === id,
  );
}

export function potentialSavings(item: ProcurementItem): number {
  return Math.max(0, item.estimatedCost - item.negotiatedValue);
}

export function stageIndex(stage: ProcurementStage): number {
  const idx = PROCUREMENT_STAGES.indexOf(stage);
  return idx >= 0 ? idx : 0;
}

export function csvEscape(value: string | number): string {
  const text = String(value);
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function matchesSeller(item: ProcurementItem, sellerId?: string): boolean {
  if (!sellerId) return true;
  return (
    item.supplierId === sellerId ||
    item.selectedSellerId === sellerId ||
    (item.assignedSellers ?? []).some((row) => row.supplierId === sellerId)
  );
}

export function sellerVisibleOffers(
  item: ProcurementItem,
  sellerId?: string,
): ProcurementItem["offers"] {
  if (!sellerId) return item.offers;
  return item.offers.filter((offer) => offer.supplierId === sellerId);
}

export function defaultTimeline(at: string, doneTitles: string[] = ["Created"]): ProcurementItem["timeline"] {
  const titles = [
    "Created",
    "Under Review",
    "Seller Sourcing",
    "Quotation",
    "Negotiation",
    "Approval",
    "PO Created",
    "Seller Confirmed",
    "Dispatched",
    "Delivered",
    "Completed",
  ];
  return titles.map((title, index) => ({
    id: `t${index + 1}`,
    title,
    description: doneTitles.includes(title) ? "Completed" : "Pending",
    at: doneTitles.includes(title) ? at : "",
    done: doneTitles.includes(title),
  }));
}

export function markTimeline(
  timeline: ProcurementItem["timeline"],
  title: string,
  at: string,
): ProcurementItem["timeline"] {
  return timeline.map((event) =>
    event.title === title
      ? { ...event, done: true, at, description: "Completed" }
      : event,
  );
}

export function formatInrPerMt(value: number): string {
  return `₹${value.toLocaleString("en-IN")}/MT`;
}
