export type LocationStatus = "active" | "inactive";

export type SellerType = "distributor" | "trader" | "manufacturer" | "stockist";

export type VerificationStatus =
  "saved" | "incomplete" | "verification_pending" | "verified";

export type OfferStatus = "draft" | "active" | "paused" | "expired";

export type ProductOfferStatus = "none" | "active" | "draft" | "paused";

export type PurchaseRequestStatus =
  "new" | "under_review" | "accepted" | "counter_sent" | "rejected" | "expired";

export type SellerOrderStatus =
  | "confirmed"
  | "processing"
  | "ready_for_dispatch"
  | "in_transit"
  | "delivered"
  | "cancelled";

export type DispatchStatus = "ready" | "scheduled" | "loading" | "dispatched";

export type ShipmentStatus =
  "IN_TRANSIT" | "DELIVERED" | "LOADING" | "DISPATCHED" | "CANCELLED";

export type ShipmentTab = "IN_TRANSIT" | "DELIVERED";

export type SettlementStatus = "pending" | "processing" | "settled" | "on_hold";

export type PaymentMethod = "NEFT" | "RTGS" | "IMPS" | "Cheque" | "UPI";

export type SellerPaymentStatus = "processing" | "received" | "failed";

export type DocumentCategory =
  | "GST"
  | "PAN"
  | "Bank Proof"
  | "Company Registration"
  | "Address Proof"
  | "Compliance Certificates"
  | "Other";

export type SellerDocumentStatus =
  "verified" | "pending_verification" | "expiring_soon" | "expired";

export type NotificationCategory =
  "orders" | "offers" | "payments" | "documents" | "requests";

export type ActivityType =
  "offer" | "request" | "order" | "dispatch" | "payment" | "document";

export interface SellerLocation {
  id: string;
  name: string;
  city: string;
  state: string;
  warehouse: string;
  status: LocationStatus;
  availableStockMt: number;
  activeOffers: number;
  activeOrders: number;
  decisionMaker: string;
  decisionMakerRole: string;
}

export interface AccountManager {
  id: string;
  name: string;
  mobile: string;
  email: string;
  region: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  poEmail: string;
  isPrimary: boolean;
}

export interface SellerProfile {
  id: string;
  companyName: string;
  legalName: string;
  businessType: string;
  sellerType: SellerType;
  gst: string;
  pan: string;
  contactPerson: string;
  designation: string;
  mobile: string;
  email: string;
  registeredAddress: string;
  yearsInBusiness: string;
  primaryCategories: string[];
  operatingCapacityMt: number;
  monthlyTradingCapacityMt: number;
  paymentTerms: string;
  offerValidityHours: number;
  volumeSoldLastMonthMt: number;
  preferredContactMethod: string;
  verificationStatus: VerificationStatus;
  locations: SellerLocation[];
  bankAccounts: BankAccount[];
  accountManager: AccountManager;
}

export interface SellerProduct {
  id: string;
  category: string;
  gradeName: string;
  manufacturer: string;
  gradeCode: string;
  polymerType: string;
  application: string;
  mfi: string;
  packagingType: string;
  unit: "MT" | "kg";
  availableStock: number;
  reservedStock: number;
  committedStock: number;
  locationId: string;
  moq: number;
  notes: string;
  offerStatus: ProductOfferStatus;
  origin?: string;
  basePrice?: number;
  currency?: string;
  gstPercent?: number;
  paymentTerms?: string;
  warehouse?: string;
  updatedAt: string;
  createdAt: string;
}

export interface BulkPriceSlab {
  id: string;
  minQty: number;
  maxQty: number | null;
  price: number;
}

export interface SellerOffer {
  id: string;
  sellerId: string;
  locationId: string;
  productId: string;
  category: string;
  gradeName: string;
  manufacturer: string;
  price: number;
  unit: string;
  availableQty: number;
  moq: number;
  validityHours: number;
  validUntil: string;
  paymentTerms: string;
  deliveryLocation: string;
  remarks: string;
  gstPercent: number;
  bulkPricing: BulkPriceSlab[];
  status: OfferStatus;
  updatedAt: string;
  createdAt: string;
}

export interface SellerPurchaseRequest {
  id: string;
  requestNumber: string;
  productId: string;
  category: string;
  gradeName: string;
  quantityMt: number;
  requestedPrice: number;
  deliveryLocation: string;
  requestedDeliveryDate: string;
  paymentTerms: string;
  notes: string;
  status: PurchaseRequestStatus;
  buyerId: string;
  buyerLabel: string;
  locationId: string;
  receivedAt: string;
  counterPrice?: number;
  counterQty?: number;
  counterValidity?: string;
  counterRemark?: string;
}

export interface OrderDocument {
  id: string;
  type: "PO" | "Invoice" | "E-way Bill" | "Delivery Challan";
  name: string;
  url?: string;
}

export interface TimelineStep {
  id: string;
  label: string;
  status: "completed" | "current" | "pending";
  at?: string;
}

export interface SellerOrder {
  id: string;
  orderId: string;
  productId: string;
  category: string;
  gradeName: string;
  quantityMt: number;
  pricePerKg: number;
  orderValue: number;
  locationId: string;
  locationName: string;
  deliveryLocation: string;
  buyerRef: string;
  paymentTerms: string;
  status: SellerOrderStatus;
  orderDate: string;
  documents: OrderDocument[];
  timeline: TimelineStep[];
}

export interface SellerDispatch {
  id: string;
  orderId: string;
  gradeName: string;
  quantityMt: number;
  loadingLocation: string;
  locationId: string;
  vehicle?: string;
  transporter?: string;
  driver?: string;
  scheduledDate: string;
  slot?: string;
  buyerRef?: string;
  ewayBill?: string;
  status: DispatchStatus;
}

export interface SellerShipment {
  id: string;
  orderId: string;
  grade: string;
  quantity: number;
  unit: string;
  vehicleNumber: string;
  route: string;
  status: ShipmentStatus;
  eta: string;
  origin: string;
  destination: string;
  locationId: string;
  driver?: string;
  dispatchDate?: string;
  timeline: TimelineStep[];
}

export interface SellerSettlement {
  id: string;
  settlementId: string;
  orderId: string;
  buyerRef: string;
  amount: number;
  grossAmount: number;
  gstAmount: number;
  commission: number;
  otherDeductions: number;
  deductions: number;
  invoiceDate: string;
  settlementDate?: string;
  paymentDate?: string;
  paymentReference?: string;
  status: SettlementStatus;
  invoiceRef: string;
  timeline: TimelineStep[];
}

export interface SellerPayment {
  id: string;
  paymentId: string;
  orderId: string;
  buyerRef: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  status: SellerPaymentStatus;
  reference: string;
}

export interface SellerDocumentRecord {
  id: string;
  name: string;
  category: DocumentCategory;
  status: SellerDocumentStatus;
  uploadedAt: string;
  expiresAt?: string;
  fileName: string;
  version?: number;
}

export interface SellerNotification {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  read: boolean;
  createdAt: string;
  href?: string;
}

export interface SellerActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  at: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  delta: number;
  reason: string;
  at: string;
}

export interface OfferFormValues {
  productId: string;
  price: number;
  unit: string;
  validityHours: number;
  availableQty: number;
  moq: number;
  deliveryLocation: string;
  paymentTerms: string;
  remarks: string;
  gstPercent: number;
  bulkPricing: BulkPriceSlab[];
}

export interface ProductFormValues {
  category: string;
  gradeName: string;
  manufacturer: string;
  gradeCode: string;
  polymerType: string;
  application: string;
  mfi: string;
  packagingType: string;
  unit: "MT" | "kg";
  availableStock: number;
  locationId: string;
  moq: number;
  notes: string;
  origin?: string;
  basePrice?: number;
  currency?: string;
  gstPercent?: number;
  paymentTerms?: string;
  warehouse?: string;
  reservedStock?: number;
}

export interface CounterOfferValues {
  price: number;
  quantity: number;
  validity: string;
  remark: string;
}
