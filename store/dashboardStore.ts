import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { dashboardMock } from "@/mock/dashboard";
import type {
  ActivityLog,
  CommandAction,
  DashboardFilters,
  DashboardMetrics,
  DashboardSeller,
  MarketIndex,
  PriorityTask,
  Transaction,
} from "@/types/dashboard";

interface DashboardState {
  seller: DashboardSeller;
  marketIndex: MarketIndex;
  metrics: DashboardMetrics;
  transactions: Transaction[];
  priorityTasks: PriorityTask[];
  activityLogs: ActivityLog[];
  commandActions: CommandAction[];
  totalTransactionEntries: number;
  search: string;
  transactionPage: number;
  pageSize: number;
  sortKey: "orderId" | "commodity" | "value" | "status";
  sortDirection: "asc" | "desc";
  filters: DashboardFilters;
  filterDrawerOpen: boolean;
  selectedTask: PriorityTask | null;
  taskDrawerOpen: boolean;
  fabOpen: boolean;
  isLoading: boolean;
  setSearch: (search: string) => void;
  setTransactionPage: (page: number) => void;
  setSort: (
    key: DashboardState["sortKey"],
    direction?: DashboardState["sortDirection"],
  ) => void;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  resetFilters: () => void;
  applyFilters: (filters: DashboardFilters) => void;
  setFilterDrawerOpen: (open: boolean) => void;
  openTaskDrawer: (task: PriorityTask) => void;
  closeTaskDrawer: () => void;
  setFabOpen: (open: boolean) => void;
  getFilteredTransactions: () => Transaction[];
  getPaginatedTransactions: () => Transaction[];
}

const defaultFilters: DashboardFilters = {
  dateFrom: "",
  dateTo: "",
  warehouse: "all",
  product: "all",
  status: "all",
  settlement: "all",
};

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      seller: dashboardMock.seller,
      marketIndex: dashboardMock.marketIndex,
      metrics: dashboardMock.metrics,
      transactions: dashboardMock.transactions,
      priorityTasks: dashboardMock.priorityTasks,
      activityLogs: dashboardMock.activityLogs,
      commandActions: dashboardMock.commandActions,
      totalTransactionEntries: dashboardMock.totalTransactionEntries,
      search: "",
      transactionPage: 1,
      pageSize: 4,
      sortKey: "orderId",
      sortDirection: "asc",
      filters: defaultFilters,
      filterDrawerOpen: false,
      selectedTask: null,
      taskDrawerOpen: false,
      fabOpen: false,
      isLoading: false,
      setSearch: (search) => set({ search, transactionPage: 1 }),
      setTransactionPage: (page) => set({ transactionPage: page }),
      setSort: (key, direction) => {
        const current = get();
        const nextDirection =
          direction ??
          (current.sortKey === key && current.sortDirection === "asc"
            ? "desc"
            : "asc");
        set({ sortKey: key, sortDirection: nextDirection });
      },
      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),
      resetFilters: () =>
        set({ filters: defaultFilters, search: "", transactionPage: 1 }),
      applyFilters: (filters) =>
        set({ filters, filterDrawerOpen: false, transactionPage: 1 }),
      setFilterDrawerOpen: (open) => set({ filterDrawerOpen: open }),
      openTaskDrawer: (task) =>
        set({ selectedTask: task, taskDrawerOpen: true }),
      closeTaskDrawer: () => set({ selectedTask: null, taskDrawerOpen: false }),
      setFabOpen: (open) => set({ fabOpen: open }),
      getFilteredTransactions: () => {
        const { transactions, search, filters, sortKey, sortDirection } = get();
        const query = search.trim().toLowerCase();

        const filtered = transactions.filter((txn) => {
          const matchesSearch =
            !query ||
            txn.orderId.toLowerCase().includes(query) ||
            txn.commodity.toLowerCase().includes(query) ||
            txn.status.toLowerCase().includes(query);

          const matchesStatus =
            filters.status === "all" || txn.status === filters.status;

          const matchesProduct =
            filters.product === "all" ||
            txn.commodity.toLowerCase().includes(filters.product.toLowerCase());

          return matchesSearch && matchesStatus && matchesProduct;
        });

        return [...filtered].sort((a, b) => {
          const left = a[sortKey];
          const right = b[sortKey];
          if (typeof left === "number" && typeof right === "number") {
            return sortDirection === "asc" ? left - right : right - left;
          }
          const cmp = String(left).localeCompare(String(right));
          return sortDirection === "asc" ? cmp : -cmp;
        });
      },
      getPaginatedTransactions: () => {
        const { transactionPage, pageSize } = get();
        const filtered = get().getFilteredTransactions();
        const start = (transactionPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
      },
    }),
    { name: "dashboard-store" },
  ),
);
