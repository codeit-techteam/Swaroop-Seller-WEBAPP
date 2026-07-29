import type {
  ActivityLog,
  CommandAction,
  DashboardMetrics,
  DashboardSeller,
  MarketIndex,
  PriorityTask,
  Transaction,
} from "@/types/dashboard";

export const dashboardSeller: DashboardSeller = {
  name: "Operations Lead",
  role: "Operations Lead",
  company: "Reliance Industries",
  warehouse: "Hazira Complex",
};

export const marketIndexMock: MarketIndex = {
  commodity: "Polypropylene",
  changePercent: 1.2,
  direction: "up",
};

export const dashboardMetricsMock: DashboardMetrics = {
  availableInventory: 4250,
  availableInventoryUnit: "MT",
  activeOffers: 12,
  pendingRequests: 8,
  pendingSettlement: 4.2,
  pendingSettlementLabel: "₹4.2 Cr",
  dispatchPending: 18,
};

export const transactionsMock: Transaction[] = [
  {
    id: "txn-1",
    orderId: "PC-98231",
    commodity: "Crude Oil (Brent)",
    value: 450200,
    currency: "INR",
    status: "SOURCED",
    createdAt: "2024-05-15T08:30:00.000Z",
  },
  {
    id: "txn-2",
    orderId: "PC-98244",
    commodity: "Natural Gas (LNG)",
    value: 1120000,
    currency: "INR",
    status: "PENDING",
    createdAt: "2024-05-15T09:10:00.000Z",
  },
  {
    id: "txn-3",
    orderId: "PC-98259",
    commodity: "PetCoke Grade A",
    value: 235500,
    currency: "INR",
    status: "LIVE",
    createdAt: "2024-05-14T16:45:00.000Z",
  },
  {
    id: "txn-4",
    orderId: "PC-98267",
    commodity: "Heavy Fuel Oil",
    value: 892100,
    currency: "INR",
    status: "CLOSED",
    createdAt: "2024-05-14T11:20:00.000Z",
  },
  {
    id: "txn-5",
    orderId: "PC-98271",
    commodity: "Polypropylene H110MA",
    value: 678400,
    currency: "INR",
    status: "LIVE",
    createdAt: "2024-05-13T14:05:00.000Z",
  },
  {
    id: "txn-6",
    orderId: "PC-98280",
    commodity: "HDPE Blow Grade",
    value: 512300,
    currency: "INR",
    status: "PENDING",
    createdAt: "2024-05-13T10:40:00.000Z",
  },
  {
    id: "txn-7",
    orderId: "PC-98288",
    commodity: "PVC Resin SG5",
    value: 334750,
    currency: "INR",
    status: "SOURCED",
    createdAt: "2024-05-12T18:15:00.000Z",
  },
  {
    id: "txn-8",
    orderId: "PC-98295",
    commodity: "LLDPE F2001P",
    value: 421900,
    currency: "INR",
    status: "CLOSED",
    createdAt: "2024-05-12T09:50:00.000Z",
  },
];

export const priorityTasksMock: PriorityTask[] = [
  {
    id: "task-1",
    type: "dispatch",
    title: "Upcoming Dispatch: Order #PT-492",
    description: "Hazira Loading Bay 4 • 14:00 IST",
    urgent: true,
    time: "14:00 IST",
    meta: "Hazira Loading Bay 4",
  },
  {
    id: "task-2",
    type: "certificate",
    title: "Pollution Certificate Expiring",
    description: "Action required in 48 hours",
    urgent: true,
    meta: "Hazira Complex",
  },
  {
    id: "task-3",
    type: "settlement",
    title: "Settlement Pending Verification",
    description: "Batch #ST-8841 • ₹1.2 Cr",
    urgent: true,
    value: "₹1.2 Cr",
    meta: "Batch #ST-8841",
  },
  {
    id: "task-4",
    type: "compliance",
    title: "KYC Document Re-verification",
    description: "Bank proof rejected by compliance desk",
    urgent: true,
    meta: "Compliance Center",
  },
];

export const activityLogsMock: ActivityLog[] = [
  {
    id: "act-1",
    title: "Purchase Request Received",
    description: "Buyer Indorama requested 120 MT PP H110MA from Mundra stock.",
    time: "10:24 AM",
    status: "info",
  },
  {
    id: "act-2",
    title: "Offer Verified",
    description: "PetroTrade compliance bot verified Offer #OF-2291.",
    time: "09:48 AM",
    status: "success",
  },
  {
    id: "act-3",
    title: "Price Revision Approved",
    description: "Revision #PR-118 approved for LDPE Grade 2420H (+₹1,200/MT).",
    time: "08:15 AM",
    status: "success",
  },
  {
    id: "act-4",
    title: "Dispatch Slot Confirmed",
    description: "Order #PT-492 assigned to Hazira Loading Bay 4 at 14:00 IST.",
    time: "07:52 AM",
    status: "warning",
  },
  {
    id: "act-5",
    title: "Settlement Flagged",
    description: "Batch #ST-8841 awaiting finance verification for ₹1.2 Cr.",
    time: "Yesterday",
    status: "danger",
  },
];

export const commandActionsMock: CommandAction[] = [
  {
    id: "cmd-1",
    label: "Create Offer",
    action: "create-offer",
    href: "/offers",
  },
  {
    id: "cmd-2",
    label: "Update Stock",
    action: "update-stock",
    href: "/inventory",
  },
  {
    id: "cmd-3",
    label: "Upload KYC",
    action: "upload-kyc",
    href: "/document-center",
  },
  { id: "cmd-4", label: "Reports", action: "reports", href: "/analytics" },
];

export const dashboardMock = {
  seller: dashboardSeller,
  marketIndex: marketIndexMock,
  metrics: dashboardMetricsMock,
  transactions: transactionsMock,
  priorityTasks: priorityTasksMock,
  activityLogs: activityLogsMock,
  commandActions: commandActionsMock,
  totalTransactionEntries: 248,
};

export {
  activityLogsMock as activityMock,
  priorityTasksMock as priorityTasksData,
  transactionsMock as transactionsData,
};
