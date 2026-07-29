export type NotificationCategory =
  | "Purchase Request"
  | "Offer Approved"
  | "Offer Changes Requested"
  | "Inventory Reserved"
  | "Dispatch Scheduled"
  | "Shipment Delayed"
  | "Settlement Released"
  | "Compliance Alert"
  | "Document Expiring"
  | "System Update";

export type NotificationPriority =
  "Critical" | "Urgent" | "High" | "Medium" | "Low";

export type NotificationDatePreset = "Today" | "Last 7 Days" | "Last 30 Days";

export type NotificationReadFilter = "All" | "Unread" | "Read";

export interface NotificationTimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status?: "completed" | "current" | "pending";
}

export interface NotificationAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

export interface RelatedOrder {
  id: string;
  orderNumber: string;
  product: string;
  quantity: string;
  status: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  read: boolean;
  archived: boolean;
  pinned: boolean;
  referenceNumber: string;
  referenceLabel?: string;
  createdAt: string;
  timeline: NotificationTimelineEvent[];
  attachments: NotificationAttachment[];
  relatedOrder?: RelatedOrder;
}

export interface NotificationFilters {
  datePreset: NotificationDatePreset;
  category: NotificationCategory | "All Categories";
  priority: NotificationPriority | "All Priorities";
  readStatus: NotificationReadFilter;
}

export interface NotificationSummary {
  newPurchaseRequests: number;
  priceRevisions: number;
  complianceAlerts: number;
  dispatchUpdates: number;
  settlementUpdates: number;
}

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  "Purchase Request",
  "Offer Approved",
  "Offer Changes Requested",
  "Inventory Reserved",
  "Dispatch Scheduled",
  "Shipment Delayed",
  "Settlement Released",
  "Compliance Alert",
  "Document Expiring",
  "System Update",
];

export const NOTIFICATION_PRIORITIES: NotificationPriority[] = [
  "Critical",
  "Urgent",
  "High",
  "Medium",
  "Low",
];
