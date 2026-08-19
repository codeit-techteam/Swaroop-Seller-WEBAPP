export type ProcurementDocumentType = "PR" | "PO";

export type ProcurementStatus =
  | "DRAFT"
  | "NEW"
  | "UNDER_REVIEW"
  | "SELLER_SOURCING"
  | "QUOTATION_RECEIVED"
  | "NEGOTIATION"
  | "APPROVAL_PENDING"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "CONVERTED_TO_PO"
  | "PO_CREATED"
  | "CANCELLED"
  | "COMPLETED";

export type PoStatus =
  | "PO_DRAFT"
  | "SENT_TO_SELLER"
  | "SELLER_REVIEW"
  | "CONFIRMED"
  | "PARTIALLY_CONFIRMED"
  | "REJECTED"
  | "READY_FOR_DISPATCH"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export type ProcurementPriority = "NORMAL" | "HIGH" | "URGENT";

export type ProcurementStage =
  | "CREATED"
  | "UNDER_REVIEW"
  | "SELLER_SOURCING"
  | "QUOTATION"
  | "NEGOTIATION"
  | "APPROVAL"
  | "PO_CREATED"
  | "SELLER_CONFIRMED"
  | "DISPATCHED"
  | "DELIVERED"
  | "COMPLETED"
  | "REQUEST_CREATED"
  | "SUPPLIER_SEARCH"
  | "OFFER_RECEIVED"
  | "READY_FOR_DISPATCH";

export type OfferStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "COUNTERED"
  | "DRAFT"
  | "SUBMITTED"
  | "REVISION_REQUESTED";

export type NegotiationActor = "SUPPLIER" | "ADMIN";

export type NegotiationLifecycle = "NONE" | "ACTIVE" | "COMPLETED";

export type ComplianceFlag = "VALID" | "PENDING" | "FAILED";

export type SellerQueueStatus =
  | "UNASSIGNED"
  | "RFQ_SENT"
  | "QUOTE_PENDING"
  | "QUOTATION_RECEIVED"
  | "NEGOTIATING"
  | "SELECTED"
  | "PO_ISSUED";

export type RejectionReason =
  | "Price too high"
  | "Supplier issue"
  | "Quantity mismatch"
  | "Compliance issue"
  | "Buyer cancelled"
  | "Other";

export interface ProcurementParty {
  name: string;
  company: string;
  contact: string;
  email: string;
  location: string;
}

export interface AssignedSeller {
  supplierId: string;
  supplierName: string;
  rfqSentAt: string;
}

export interface ProcurementOffer {
  id: string;
  supplierId: string;
  supplierName: string;
  unitPrice: number;
  quantity: number;
  availableQty?: number;
  delivery: string;
  deliveryDays?: number;
  paymentTerms: string;
  creditTerms?: string;
  validity?: string;
  compliance?: ComplianceFlag;
  rating?: number;
  status: OfferStatus;
  moq: number;
  contact: string;
  dispatchLocation?: string;
  remarks?: string;
  submittedAt?: string;
}

export interface NegotiationMessage {
  id: string;
  actor: NegotiationActor;
  actorName: string;
  unitPrice: number;
  quantity: number;
  deliveryDate?: string;
  paymentTerms?: string;
  message: string;
  createdAt: string;
}

export interface ProcurementNote {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface ProcurementActivity {
  id: string;
  at: string;
  actor: string;
  message: string;
}

export interface ProcurementTimelineEvent {
  id: string;
  title: string;
  description: string;
  at: string;
  done: boolean;
}

export interface ProcurementAttachment {
  id: string;
  name: string;
  kind:
    | "CUSTOMER_PR"
    | "RFQ"
    | "QUOTATION"
    | "COMMERCIAL"
    | "COMPLIANCE"
    | "PO"
    | "SHIPPING"
    | "OTHER";
  uploadedAt: string;
  visibleToSeller: boolean;
}

export interface DispatchInfo {
  vehicle: string;
  lrNumber: string;
  origin: string;
  eta: string;
  dispatchedAt: string;
}

export interface ShipmentInfo {
  trackingId: string;
  carrier: string;
  status: "READY" | "DISPATCHED" | "IN_TRANSIT" | "DELIVERED";
  eta: string;
  updatedAt: string;
}

export interface SellerConfirmation {
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CHANGE_REQUESTED";
  quantity?: number;
  deliveryDate?: string;
  reason?: string;
  at?: string;
}

export interface ProcurementItem {
  id: string;
  requestId: string;
  prId?: string;
  poId?: string;
  type: ProcurementDocumentType;
  commodity: string;
  grade: string;
  buyer: string;
  buyerCompany: string;
  buyerContact: string;
  buyerEmail: string;
  supplier: string;
  supplierId: string;
  supplierContact: string;
  estimatedCost: number;
  unitPrice: number;
  negotiatedValue: number;
  quantityMt: number;
  quantityUnit: "MT" | "KG";
  status: ProcurementStatus;
  poStatus?: PoStatus;
  stage: ProcurementStage;
  priority: ProcurementPriority;
  warehouse: string;
  destination: string;
  paymentTerms: string;
  creditTerms?: string;
  creditRequired: boolean;
  assignedTo: string;
  owner: string;
  createdAt: string;
  requestedDeliveryDate: string;
  approvedAt?: string;
  expectedCompletion: string;
  processingHours: number;
  description: string;
  reason: string;
  internalRemarks: string;
  rejectionReason?: string;
  rejectionRemarks?: string;
  commission: number;
  margin?: number;
  deliveryCharges?: number;
  taxes?: number;
  delayed: boolean;
  sellerStatus?: SellerQueueStatus;
  negotiationStatus?: NegotiationLifecycle;
  selectedSellerId?: string;
  assignedSellers?: AssignedSeller[];
  offers: ProcurementOffer[];
  negotiation: NegotiationMessage[];
  notes: ProcurementNote[];
  timeline: ProcurementTimelineEvent[];
  activity: ProcurementActivity[];
  documents?: ProcurementAttachment[];
  sellerConfirmation?: SellerConfirmation;
  dispatch?: DispatchInfo;
  shipment?: ShipmentInfo;
}

export interface ProcurementSummary {
  pendingApprovals: number;
  averageProcessingHours: number;
  activeNegotiations: number;
  openPoValue: number;
  newRequests: number;
  underReview: number;
  awaitingQuote: number;
  overdue: number;
  pendingPrs: number;
  quotationPending: number;
  poAwaitingSeller: number;
  dispatchPending: number;
  completed: number;
}

export interface CreatePurchaseRequestInput {
  commodity: string;
  grade: string;
  quantity: number;
  quantityUnit: "MT" | "KG";
  requestedDeliveryDate: string;
  priority: ProcurementPriority;
  buyer: string;
  buyerCompany: string;
  destination: string;
  supplierId: string;
  supplier: string;
  unitPrice: number;
  warehouse: string;
  paymentTerms: string;
  creditTerms?: string;
  creditRequired: boolean;
  reason: string;
  notes: string;
  internalRemarks: string;
  asDraft?: boolean;
}

export interface CounterOfferInput {
  unitPrice: number;
  quantity: number;
  deliveryDate: string;
  paymentTerms: string;
  message: string;
}

export interface SubmitQuoteInput {
  unitPrice: number;
  availableQty: number;
  moq: number;
  deliveryDays: number;
  dispatchLocation: string;
  paymentTerms: string;
  creditTerms: string;
  validity: string;
  remarks: string;
  asDraft?: boolean;
}

export interface DispatchInput {
  vehicle: string;
  lrNumber: string;
  origin: string;
  eta: string;
}

export interface ProcurementBuyerOption {
  name: string;
  company: string;
  location: string;
}

export const PROCUREMENT_STAGES: ProcurementStage[] = [
  "CREATED",
  "UNDER_REVIEW",
  "SELLER_SOURCING",
  "QUOTATION",
  "NEGOTIATION",
  "APPROVAL",
  "PO_CREATED",
  "SELLER_CONFIRMED",
  "DISPATCHED",
  "DELIVERED",
  "COMPLETED",
];

export const QUEUE_STATUSES: ProcurementStatus[] = [
  "NEW",
  "UNDER_REVIEW",
  "SELLER_SOURCING",
  "QUOTATION_RECEIVED",
  "NEGOTIATION",
  "APPROVAL_PENDING",
  "APPROVED",
  "REJECTED",
  "CONVERTED_TO_PO",
  "COMPLETED",
];
