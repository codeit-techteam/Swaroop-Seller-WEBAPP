export type OrderStatus =
  | "new"
  | "accepted"
  | "processing"
  | "dispatch_ready"
  | "in_transit"
  | "delivered"
  | "delayed"
  | "cancelled";

export type OrderTab =
  | "new"
  | "accepted"
  | "processing"
  | "dispatch_ready"
  | "in_transit"
  | "delivered"
  | "cancelled";

export type PaymentTerm = "advance" | "credit_15" | "credit_30" | "on_delivery";

export type WarehouseCode = "Hazira" | "Mundra" | "JNPT" | "Dahej" | "Kandla";

export type SettlementStatus =
  "funds_secured" | "settlement_pending" | "settlement_completed";

export type OrderDocumentType =
  "invoice" | "loading_slip" | "eway_bill" | "coa";

export type TimelineStepStatus = "completed" | "current" | "pending";

export type SupportIssueType =
  "Delivery" | "Invoice" | "Payment" | "Vehicle" | "Damage" | "Other";

export type RejectReason =
  | "Inventory Unavailable"
  | "Price Not Acceptable"
  | "Capacity Constraint"
  | "Warehouse Issue"
  | "Other";

export type StatusUpdateValue =
  | "processing"
  | "qc_complete"
  | "ready"
  | "loading"
  | "dispatched"
  | "in_transit"
  | "delivered";

export type OrderValueRange =
  "All Values" | "Under 5L" | "5L - 25L" | "25L - 1Cr" | "Above 1Cr";

export interface GradeSpecs {
  density: string;
  mfi: string;
  application: string;
  coaUrl?: string;
}

export interface OrderDocument {
  id: string;
  type: OrderDocumentType;
  name: string;
  number?: string;
  available: boolean;
  sizeLabel: string;
  mimeType: string;
}

export interface TransportDetails {
  carrier: string;
  vehicleNumber: string;
  driver: string;
  eta: string;
}

export interface TimelineStep {
  id: string;
  key: string;
  title: string;
  description: string;
  timestamp?: string;
  status: TimelineStepStatus;
}

export interface FinancialBreakdown {
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  freight: number;
  insurance: number;
  totalLandedCost: number;
}

export interface PaymentRisk {
  creditStatus: string;
  tradeInsurance: string;
  paymentTermsLabel: string;
  incoterms: string;
}

export interface BillingInfo {
  registration: string;
  billingAddress: string;
}

export interface SupportTicket {
  id: string;
  orderId: string;
  issueType: SupportIssueType;
  description: string;
  attachmentName?: string;
  createdAt: string;
  status: "open" | "resolved";
}

export interface Order {
  id: string;
  orderNumber: string;
  /** Blind marketplace — company name only, never phone/email/contact */
  buyerCompany: string;
  productName: string;
  productGrade: string;
  materialCategory: string;
  quantityMt: number;
  unitPrice: number;
  packaging: string;
  warehouse: WarehouseCode;
  warehouseLabel: string;
  dispatchDate: string;
  eta: string;
  paymentTerm: PaymentTerm;
  paymentLabel: string;
  status: OrderStatus;
  settlementStatus: SettlementStatus;
  gradeSpecs: GradeSpecs;
  dispatchInstructions: string;
  documents: OrderDocument[];
  transport: TransportDetails | null;
  timeline: TimelineStep[];
  detailTimeline: TimelineStep[];
  financials: FinancialBreakdown;
  paymentRisk: PaymentRisk;
  billing: BillingInfo;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  invoiceNumber?: string;
  pendingInvoice: boolean;
  processingDays?: number;
  rejectReason?: RejectReason;
  rejectRemark?: string;
  acceptedAt?: string;
  estimatedDispatch?: string;
}

export interface OrderFilters {
  search: string;
  status: string;
  warehouse: string;
  paymentType: string;
  dateFrom: string;
  dateTo: string;
  orderValue: OrderValueRange;
}

export interface OrderSummary {
  totalVolumeMt: number;
  pendingInvoices: number;
  avgProcessingDays: number;
  readyForDispatch: number;
}

export interface StatusUpdateForm {
  status: StatusUpdateValue | "";
  remarks: string;
}

export interface SupportTicketForm {
  issueType: SupportIssueType | "";
  description: string;
  attachmentName: string;
}

export interface AcceptOrderForm {
  estimatedDispatch: string;
  generatePi: boolean;
}

export interface RejectOrderForm {
  reason: RejectReason | "";
  remarks: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "New",
  accepted: "Accepted",
  processing: "Processing",
  dispatch_ready: "Dispatch Ready",
  in_transit: "In Transit",
  delivered: "Delivered",
  delayed: "Delayed",
  cancelled: "Cancelled",
};

export const ORDER_TABS: { key: OrderTab; label: string }[] = [
  { key: "new", label: "New Orders" },
  { key: "accepted", label: "Accepted" },
  { key: "processing", label: "Processing" },
  { key: "dispatch_ready", label: "Dispatch Ready" },
  { key: "in_transit", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export const ORDER_STATUSES = [
  "All Status",
  "new",
  "accepted",
  "processing",
  "dispatch_ready",
  "in_transit",
  "delivered",
  "delayed",
  "cancelled",
] as const;

export const ORDER_WAREHOUSES = [
  "All Warehouses",
  "Hazira",
  "Mundra",
  "JNPT",
  "Dahej",
  "Kandla",
] as const;

export const ORDER_PAYMENT_TYPES = [
  "All Payment Types",
  "advance",
  "credit_15",
  "credit_30",
  "on_delivery",
] as const;

export const ORDER_VALUE_RANGES: OrderValueRange[] = [
  "All Values",
  "Under 5L",
  "5L - 25L",
  "25L - 1Cr",
  "Above 1Cr",
];

export const PAYMENT_TERM_LABELS: Record<PaymentTerm, string> = {
  advance: "100% Advance",
  credit_15: "Credit 15 Days",
  credit_30: "Credit 30 Days",
  on_delivery: "On Delivery",
};

export const SETTLEMENT_LABELS: Record<SettlementStatus, string> = {
  funds_secured: "Funds secured in Escrow",
  settlement_pending: "Settlement Pending",
  settlement_completed: "Settlement Completed",
};

export const STATUS_UPDATE_OPTIONS: {
  value: StatusUpdateValue;
  label: string;
  mapsTo: OrderStatus;
}[] = [
  { value: "processing", label: "Processing", mapsTo: "processing" },
  { value: "qc_complete", label: "QC Complete", mapsTo: "processing" },
  { value: "ready", label: "Ready", mapsTo: "dispatch_ready" },
  { value: "loading", label: "Loading", mapsTo: "dispatch_ready" },
  { value: "dispatched", label: "Dispatched", mapsTo: "in_transit" },
  { value: "in_transit", label: "In Transit", mapsTo: "in_transit" },
  { value: "delivered", label: "Delivered", mapsTo: "delivered" },
];

export const SUPPORT_ISSUE_TYPES: SupportIssueType[] = [
  "Delivery",
  "Invoice",
  "Payment",
  "Vehicle",
  "Damage",
  "Other",
];

export const REJECT_REASONS: RejectReason[] = [
  "Inventory Unavailable",
  "Price Not Acceptable",
  "Capacity Constraint",
  "Warehouse Issue",
  "Other",
];

export const defaultStatusUpdateForm: StatusUpdateForm = {
  status: "",
  remarks: "",
};

export const defaultSupportTicketForm: SupportTicketForm = {
  issueType: "",
  description: "",
  attachmentName: "",
};

export const defaultAcceptOrderForm: AcceptOrderForm = {
  estimatedDispatch: "",
  generatePi: true,
};

export const defaultRejectOrderForm: RejectOrderForm = {
  reason: "",
  remarks: "",
};
