export type TransactionStatus =
  | "SOURCED"
  | "PENDING"
  | "LIVE"
  | "PROCESSING"
  | "DISPATCHED"
  | "CLOSED";

export type PriorityTaskType =
  | "dispatch"
  | "certificate"
  | "settlement"
  | "compliance"
  | "procurement"
  | "pricing";

export type ActivityLogStatus = "info" | "success" | "warning" | "danger";

export interface DashboardMetrics {
  availableInventory: number;
  availableInventoryUnit: string;
  activeOffers: number;
  pendingRequests: number;
  activeOrders: number;
  pendingSettlement: number;
  pendingSettlementLabel: string;
  dispatchPending: number;
}

export interface DashboardSeller {
  name: string;
  role: string;
  company: string;
  warehouse: string;
}

export interface MarketIndex {
  commodity: string;
  changePercent: number;
  direction: "up" | "down";
}

export interface Transaction {
  id: string;
  orderId: string;
  commodity: string;
  buyer: string;
  quantityMt: number;
  value: number;
  currency: "INR" | "USD";
  status: TransactionStatus;
  createdAt: string;
}

export interface PriorityTask {
  id: string;
  type: PriorityTaskType;
  title: string;
  description: string;
  urgent: boolean;
  meta?: string;
  time?: string;
  value?: string;
}

export interface ActivityLog {
  id: string;
  title: string;
  description: string;
  time: string;
  status: ActivityLogStatus;
}

export interface DashboardFilters {
  dateFrom: string;
  dateTo: string;
  warehouse: string;
  product: string;
  status: string;
  settlement: string;
}

export interface CommandAction {
  id: string;
  label: string;
  href?: string;
  action?:
    | "create-offer"
    | "update-stock"
    | "upload-kyc"
    | "reports"
    | "create-pr"
    | "view-orders";
}
