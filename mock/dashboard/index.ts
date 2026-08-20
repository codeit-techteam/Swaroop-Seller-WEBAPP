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
  activeOrders: 24,
  pendingSettlement: 4.2,
  pendingSettlementLabel: "₹4.2 Cr",
  dispatchPending: 18,
};

export const transactionsMock: Transaction[] = [
  {
    id: "txn-1",
    orderId: "PC-98231",
    commodity: "Crude Oil (Brent)",
    buyer: "Indorama Ventures",
    quantityMt: 850,
    value: 4_50_20_000,
    currency: "INR",
    status: "SOURCED",
    createdAt: "2024-05-15T08:30:00.000Z",
  },
  {
    id: "txn-2",
    orderId: "PC-98244",
    commodity: "Natural Gas (LNG)",
    buyer: "GAIL India",
    quantityMt: 1200,
    value: 11_20_00_000,
    currency: "INR",
    status: "PENDING",
    createdAt: "2024-05-15T09:10:00.000Z",
  },
  {
    id: "txn-3",
    orderId: "PC-98259",
    commodity: "PetCoke Grade A",
    buyer: "Ultratech Cement",
    quantityMt: 640,
    value: 2_35_50_000,
    currency: "INR",
    status: "LIVE",
    createdAt: "2024-05-14T16:45:00.000Z",
  },
  {
    id: "txn-4",
    orderId: "PC-98267",
    commodity: "Heavy Fuel Oil",
    buyer: "HPCL",
    quantityMt: 480,
    value: 8_92_10_000,
    currency: "INR",
    status: "CLOSED",
    createdAt: "2024-05-14T11:20:00.000Z",
  },
  {
    id: "txn-5",
    orderId: "PC-98271",
    commodity: "Polypropylene H110MA",
    buyer: "Supreme Industries",
    quantityMt: 220,
    value: 6_78_40_000,
    currency: "INR",
    status: "PROCESSING",
    createdAt: "2024-05-13T14:05:00.000Z",
  },
  {
    id: "txn-6",
    orderId: "PC-98280",
    commodity: "HDPE Blow Grade",
    buyer: "Time Technoplast",
    quantityMt: 180,
    value: 5_12_30_000,
    currency: "INR",
    status: "DISPATCHED",
    createdAt: "2024-05-13T10:40:00.000Z",
  },
  {
    id: "txn-7",
    orderId: "PC-98288",
    commodity: "PVC Resin SG5",
    buyer: "Finolex Industries",
    quantityMt: 310,
    value: 3_34_75_000,
    currency: "INR",
    status: "SOURCED",
    createdAt: "2024-05-12T18:15:00.000Z",
  },
  {
    id: "txn-8",
    orderId: "PC-98295",
    commodity: "LLDPE F2001P",
    buyer: "Uflex Ltd",
    quantityMt: 150,
    value: 4_21_90_000,
    currency: "INR",
    status: "LIVE",
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
    type: "procurement",
    title: "Purchase Request Requires Review",
    description: "PR-4418 • 120 MT PP H110MA",
    urgent: true,
    meta: "Mundra Terminal 3",
  },
  {
    id: "task-3",
    type: "certificate",
    title: "Compliance Document Expiring",
    description: "Pollution certificate expires in 48 hours",
    urgent: true,
    meta: "Hazira Complex",
  },
  {
    id: "task-4",
    type: "settlement",
    title: "Settlement Pending Verification",
    description: "Batch #ST-8841 • ₹1.2 Cr",
    urgent: true,
    value: "₹1.2 Cr",
    meta: "Batch #ST-8841",
  },
  {
    id: "task-5",
    type: "compliance",
    title: "KYC Re-verification Required",
    description: "Bank proof rejected by compliance desk",
    urgent: true,
    meta: "Compliance Center",
  },
  {
    id: "task-6",
    type: "pricing",
    title: "Price Revision Awaiting Approval",
    description: "Revision #PR-118 for LDPE 2420H",
    urgent: false,
    meta: "Offer desk",
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
    title: "Payment Received",
    description: "NEFT confirmed for Settlement #ST-8832 • ₹85 L.",
    time: "07:10 AM",
    status: "success",
  },
  {
    id: "act-6",
    title: "KYC Approved",
    description: "GST and bank documents verified for Supreme Industries.",
    time: "Yesterday",
    status: "success",
  },
];

export const commandActionsMock: CommandAction[] = [
  {
    id: "cmd-1",
    label: "Create Offer",
    action: "create-offer",
    href: "/offers/create",
  },
  {
    id: "cmd-2",
    label: "Update Stock",
    action: "update-stock",
    href: "/inventory",
  },
  {
    id: "cmd-3",
    label: "Create Purchase Request",
    action: "create-pr",
    href: "/purchase-requests",
  },
  {
    id: "cmd-4",
    label: "Upload KYC",
    action: "upload-kyc",
    href: "/kyc",
  },
  {
    id: "cmd-5",
    label: "View Orders",
    action: "view-orders",
    href: "/orders",
  },
  {
    id: "cmd-6",
    label: "Add Customer",
    href: "/customers",
  },
  {
    id: "cmd-7",
    label: "Add Product",
    href: "/marketplace/catalog",
  },
  {
    id: "cmd-8",
    label: "Create Notification",
    href: "/customers/notifications",
  },
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
