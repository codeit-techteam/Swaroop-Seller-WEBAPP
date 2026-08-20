export type NotificationChannel = "PUSH" | "EMAIL" | "SMS" | "IN_APP";

export type NotificationTarget =
  | "ALL"
  | "CUSTOMER_TYPE"
  | "SPECIFIC"
  | "ACTIVE_ORDERS"
  | "PENDING_PAYMENT"
  | "PENDING_PR"
  | "CITY"
  | "SEGMENT";

export type CustomerNotificationStatus =
  "DRAFT" | "SCHEDULED" | "SENT" | "FAILED";

export type SupportTicketCategory =
  | "ORDER"
  | "PAYMENT"
  | "DELIVERY"
  | "PRODUCT"
  | "PRICING"
  | "KYC"
  | "CREDIT"
  | "ACCOUNT"
  | "OTHER";

export type SupportTicketStatus =
  "OPEN" | "IN_PROGRESS" | "WAITING_FOR_CUSTOMER" | "RESOLVED" | "CLOSED";

export type SupportPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  image?: string;
  cta: string;
  targetScreen: string;
  channels: NotificationChannel[];
  target: NotificationTarget;
  targetValue?: string;
  scheduleAt?: string;
  status: CustomerNotificationStatus;
  sentAt?: string;
  createdAt: string;
}

export interface SupportMessage {
  id: string;
  at: string;
  actor: string;
  role: "CUSTOMER" | "AGENT" | "SYSTEM";
  body: string;
}

export interface SupportTicket {
  id: string;
  ticketId: string;
  customerId: string;
  customerName: string;
  orderId?: string;
  category: SupportTicketCategory;
  priority: SupportPriority;
  status: SupportTicketStatus;
  assignedAgent: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export interface AuditLogEntry {
  id: string;
  at: string;
  actor: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  ip?: string;
  device?: string;
}

export interface GlobalSearchHit {
  id: string;
  category:
    | "Customers"
    | "Orders"
    | "Purchase Requests"
    | "Products"
    | "Categories"
    | "Offers"
    | "Invoices"
    | "Shipments"
    | "Documents"
    | "Tickets";
  title: string;
  subtitle: string;
  href: string;
}
