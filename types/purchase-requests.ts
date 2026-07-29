export type PurchaseRequestStatus =
  "pending" | "accepted" | "rejected" | "counter_sent" | "expired" | "closed";

export type RejectReason =
  | "Inventory Unavailable"
  | "Price Not Acceptable"
  | "MOQ Too Low"
  | "Warehouse Issue"
  | "Other";

export type CounterPaymentTerm =
  "advance" | "on_loading" | "on_delivery" | "credit_15" | "credit_30";

export type MaterialCategory = "HDPE" | "LLDPE" | "PP" | "PVC" | "ABS" | "LDPE";

export type WarehouseCode =
  "Hazira" | "Mundra" | "Dahej" | "JNPT" | "Panipat" | "Kandla";

export interface PurchaseDocument {
  id: string;
  name: string;
  sizeLabel: string;
  signedBy: string;
  mimeType: string;
}

export interface CounterOffer {
  basePrice: number;
  moq: number;
  availableQuantity: number;
  dispatchDate: string;
  paymentTerms: CounterPaymentTerm;
  remarks: string;
  bulkPricing?: string;
  submittedAt: string;
}

export interface PurchaseRequest {
  id: string;
  requestNumber: string;
  productName: string;
  productGrade: string;
  materialCategory: MaterialCategory;
  mfi: string;
  quantityMt: number;
  unitPrice: number;
  warehouse: WarehouseCode;
  warehouseLabel: string;
  warehouseAddress: string;
  deadline: string;
  deadlineTimeSlot: string;
  status: PurchaseRequestStatus;
  urgency: "urgent" | "normal";
  documents: PurchaseDocument[];
  procurementNotes: string;
  orderId?: string;
  rejectReason?: RejectReason;
  rejectRemark?: string;
  counterOffer?: CounterOffer;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
}

export interface PurchaseRequestFilters {
  search: string;
  status: string;
  materialGrade: string;
  warehouse: string;
  dateFrom: string;
  dateTo: string;
}

export interface PurchaseRequestSummary {
  newRequests: number;
  awaitingResponse: number;
  acceptedToday: number;
  dispatchPending: number;
}

export interface CounterOfferFormData {
  basePrice: string;
  moq: string;
  availableQuantity: string;
  dispatchDate: string;
  paymentTerms: CounterPaymentTerm;
  remarks: string;
  bulkPricing: string;
}

export const defaultCounterOfferFormData: CounterOfferFormData = {
  basePrice: "",
  moq: "",
  availableQuantity: "",
  dispatchDate: "",
  paymentTerms: "advance",
  remarks: "",
  bulkPricing: "",
};

export const REJECT_REASONS: RejectReason[] = [
  "Inventory Unavailable",
  "Price Not Acceptable",
  "MOQ Too Low",
  "Warehouse Issue",
  "Other",
];

export const COUNTER_PAYMENT_TERMS: {
  value: CounterPaymentTerm;
  label: string;
}[] = [
  { value: "advance", label: "Advance" },
  { value: "on_loading", label: "On Loading" },
  { value: "on_delivery", label: "On Delivery" },
  { value: "credit_15", label: "Credit 15" },
  { value: "credit_30", label: "Credit 30" },
];

export const PURCHASE_STATUSES = [
  "All Statuses",
  "pending",
  "accepted",
  "rejected",
  "counter_sent",
  "expired",
  "closed",
] as const;

export const MATERIAL_GRADES = [
  "All Grades",
  "HDPE",
  "LLDPE",
  "PP",
  "PVC",
  "ABS",
  "LDPE",
] as const;

export const PURCHASE_WAREHOUSES = [
  "All Warehouses",
  "Hazira",
  "Mundra",
  "Dahej",
  "JNPT",
  "Panipat",
  "Kandla",
] as const;
