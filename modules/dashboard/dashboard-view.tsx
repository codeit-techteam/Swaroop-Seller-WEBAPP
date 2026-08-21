"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Bell,
  ClipboardList,
  Filter,
  MoreHorizontal,
  Package,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import toast from "react-hot-toast";

import {
  ActionDrawer,
  ActivityCard,
  ErpPagination,
  FilterDrawer,
  PriorityCard,
  StatusChip,
  SummaryCard,
  transactionStatusVariant,
} from "@/components/erp";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/lib/constants";
import { formatCompactInr, formatNumber } from "@/lib/utils";
import { useCustomerStore } from "@/store/customerStore";
import { useDashboardStore } from "@/store/dashboardStore";
import type { DashboardFilters } from "@/types/dashboard";

function greetingForHour(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

const FILTER_LABELS: Record<
  keyof DashboardFilters,
  Record<string, string> | "date"
> = {
  dateFrom: "date",
  dateTo: "date",
  warehouse: {
    hazira: "Hazira Complex",
    mundra: "Mundra Terminal 3",
    jnpt: "JNPT Warehouse B",
    kandla: "Kandla Bulk Yard",
    panipat: "Panipat Depot",
    mumbai: "Mumbai CFS Hub",
  },
  product: {
    polypropylene: "Polypropylene",
    crude: "Crude Oil",
    lng: "Natural Gas",
    petcoke: "PetCoke",
    fuel: "Heavy Fuel Oil",
    pvc: "PVC",
    hdpe: "HDPE",
    lldpe: "LLDPE",
  },
  status: {
    SOURCED: "Sourced",
    PENDING: "Pending",
    LIVE: "Live",
    CLOSED: "Closed",
  },
  settlement: {
    pending: "Settlement pending",
    verified: "Settlement verified",
    released: "Settlement released",
  },
};

function getActiveFilterChips(filters: DashboardFilters) {
  const chips: { key: keyof DashboardFilters; label: string }[] = [];

  if (filters.dateFrom || filters.dateTo) {
    const from = filters.dateFrom || "…";
    const to = filters.dateTo || "…";
    chips.push({
      key: "dateFrom",
      label: `${from} → ${to}`,
    });
  }

  (["warehouse", "product", "status", "settlement"] as const).forEach((key) => {
    const value = filters[key];
    if (!value || value === "all") return;
    const map = FILTER_LABELS[key];
    const label = typeof map === "object" ? (map[value] ?? value) : value;
    chips.push({ key, label });
  });

  return chips;
}

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: "asc" | "desc";
}) {
  if (!active) {
    return <ArrowUpDown className="h-3 w-3 text-slate-300" />;
  }
  return direction === "asc" ? (
    <ArrowUp className="h-3 w-3 text-[#1B6EF3]" />
  ) : (
    <ArrowDown className="h-3 w-3 text-[#1B6EF3]" />
  );
}

export function DashboardView() {
  const seller = useDashboardStore((s) => s.seller);
  const metrics = useDashboardStore((s) => s.metrics);
  const priorityTasks = useDashboardStore((s) => s.priorityTasks);
  const activityLogs = useDashboardStore((s) => s.activityLogs);
  const filters = useDashboardStore((s) => s.filters);
  const sortKey = useDashboardStore((s) => s.sortKey);
  const sortDirection = useDashboardStore((s) => s.sortDirection);
  const page = useDashboardStore((s) => s.transactionPage);
  const pageSize = useDashboardStore((s) => s.pageSize);
  const setPage = useDashboardStore((s) => s.setTransactionPage);
  const setSort = useDashboardStore((s) => s.setSort);
  const setFilters = useDashboardStore((s) => s.setFilters);
  const resetFilters = useDashboardStore((s) => s.resetFilters);
  const setFilterDrawerOpen = useDashboardStore((s) => s.setFilterDrawerOpen);
  const openTaskDrawer = useDashboardStore((s) => s.openTaskDrawer);
  const closeTaskDrawer = useDashboardStore((s) => s.closeTaskDrawer);
  const selectedTask = useDashboardStore((s) => s.selectedTask);
  const taskDrawerOpen = useDashboardStore((s) => s.taskDrawerOpen);
  const getFilteredTransactions = useDashboardStore(
    (s) => s.getFilteredTransactions,
  );
  const getPaginatedTransactions = useDashboardStore(
    (s) => s.getPaginatedTransactions,
  );

  const filtered = getFilteredTransactions();
  const transactions = getPaginatedTransactions();
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const urgentCount = priorityTasks.filter((task) => task.urgent).length;
  const activeChips = useMemo(() => getActiveFilterChips(filters), [filters]);

  const clearChip = (key: keyof DashboardFilters) => {
    if (key === "dateFrom") {
      setFilters({ dateFrom: "", dateTo: "" });
      return;
    }
    setFilters({ [key]: "all" });
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {greetingForHour()}, {seller.role}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Live overview of marketplace, procurement and operations
            {seller.company ? (
              <>
                {" "}
                ·{" "}
                <span className="font-medium text-slate-600">
                  {seller.company}
                </span>
                {seller.warehouse ? (
                  <span className="text-slate-400"> · {seller.warehouse}</span>
                ) : null}
              </>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="relative gap-2 border-slate-200 bg-white"
            onClick={() => setFilterDrawerOpen(true)}
          >
            <Filter className="h-4 w-4" />
            Filter
            {activeChips.length > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1B6EF3] px-1.5 text-[11px] font-semibold text-white">
                {activeChips.length}
              </span>
            ) : null}
          </Button>
        </div>
      </div>

      {activeChips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <button
              key={`${chip.key}-${chip.label}`}
              type="button"
              onClick={() => clearChip(chip.key)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              {chip.label}
              <X className="h-3 w-3 text-slate-400" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              resetFilters();
              toast.success("Filters cleared");
            }}
            className="text-xs font-medium text-[#1B6EF3] hover:underline"
          >
            Clear all
          </button>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <SummaryCard
          title="Total Inventory"
          value={metrics.availableInventory}
          suffix={metrics.availableInventoryUnit}
          href={ROUTES.INVENTORY}
          icon={Package}
          accent="blue"
          hint="Available stock"
        />
        <SummaryCard
          title="Active Orders"
          value={metrics.activeOrders}
          href={ROUTES.ORDERS}
          icon={ShoppingCart}
          accent="blue"
          hint="In progress · tap to open"
          className="border-[#1B6EF3]/30 bg-gradient-to-br from-[#1B6EF3]/10 to-white shadow-md ring-1 ring-[#1B6EF3]/15"
        />
        <SummaryCard
          title="Pending Request"
          value={metrics.pendingRequests}
          href={ROUTES.PURCHASE_REQUESTS}
          icon={ClipboardList}
          accent="amber"
          hint="Awaiting review"
        />
        <CxMetricCards />
      </div>

      <QuickActions />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Transactions
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {filtered.length} matching{" "}
              {filtered.length === 1 ? "order" : "orders"}
            </p>
          </div>
          <Link
            href={ROUTES.ORDERS}
            className="text-sm font-medium text-[#1B6EF3] hover:underline"
          >
            View all orders
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-800">
              No transactions match
            </p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Try adjusting filters or clearing the current selection.
            </p>
            {activeChips.length > 0 ? (
              <Button
                variant="outline"
                className="mt-4 border-slate-200"
                onClick={() => {
                  resetFilters();
                  toast.success("Filters cleared");
                }}
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {(
                    [
                      { key: "orderId" as const, label: "Order ID" },
                      { key: "commodity" as const, label: "Commodity" },
                    ] as const
                  ).map((col) => (
                    <TableHead
                      key={col.key}
                      className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                      onClick={() => setSort(col.key)}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {col.label}
                        <SortIcon
                          active={sortKey === col.key}
                          direction={sortDirection}
                        />
                      </span>
                    </TableHead>
                  ))}
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Buyer
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Quantity
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                    onClick={() => setSort("value")}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      Value
                      <SortIcon
                        active={sortKey === "value"}
                        direction={sortDirection}
                      />
                    </span>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                    onClick={() => setSort("status")}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      Status
                      <SortIcon
                        active={sortKey === "status"}
                        direction={sortDirection}
                      />
                    </span>
                  </TableHead>
                  <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id} className="hover:bg-slate-50/80">
                    <TableCell>
                      <button
                        type="button"
                        className="font-medium text-[#1B6EF3] hover:underline"
                        onClick={() =>
                          toast.success(`Opened order #${txn.orderId}`)
                        }
                      >
                        #{txn.orderId}
                      </button>
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">
                      {txn.commodity}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {txn.buyer}
                    </TableCell>
                    <TableCell className="tabular-nums text-slate-700">
                      {formatNumber(txn.quantityMt)} MT
                    </TableCell>
                    <TableCell className="tabular-nums text-slate-700">
                      {formatCompactInr(txn.value)}
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        label={txn.status}
                        variant={transactionStatusVariant(txn.status)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              toast.success(`Viewing #${txn.orderId}`)
                            }
                          >
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toast.success(`Downloading #${txn.orderId}`)
                            }
                          >
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toast.success(`Printing #${txn.orderId}`)
                            }
                          >
                            Print
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ErpPagination
              page={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Today&apos;s Priority Tasks
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                {priorityTasks.length} items need attention
              </p>
            </div>
            {urgentCount > 0 ? (
              <StatusChip label={`${urgentCount} URGENT`} variant="urgent" />
            ) : null}
          </div>
          <div className="space-y-2">
            {priorityTasks.map((task) => (
              <PriorityCard
                key={task.id}
                task={task}
                onClick={() => openTaskDrawer(task)}
              />
            ))}
          </div>
        </div>

        <ActivityCard logs={activityLogs.slice(0, 6)} />
      </div>

      <FilterDrawer />

      <ActionDrawer
        open={taskDrawerOpen}
        onClose={closeTaskDrawer}
        title="Task Details"
        footer={
          <Button
            className="w-full bg-[#1B6EF3] hover:bg-[#1558C8]"
            onClick={() => {
              toast.success("Task marked as in progress (mock)");
              closeTaskDrawer();
            }}
          >
            Take Action
          </Button>
        }
      >
        {selectedTask ? (
          <div className="space-y-4">
            <div>
              <StatusChip
                label={selectedTask.urgent ? "URGENT" : "NORMAL"}
                variant={selectedTask.urgent ? "urgent" : "default"}
              />
              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                {selectedTask.title}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {selectedTask.description}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <p>
                <span className="font-medium text-slate-700">Type:</span>{" "}
                {selectedTask.type}
              </p>
              {selectedTask.meta ? (
                <p className="mt-1">
                  <span className="font-medium text-slate-700">Location:</span>{" "}
                  {selectedTask.meta}
                </p>
              ) : null}
              {selectedTask.time ? (
                <p className="mt-1">
                  <span className="font-medium text-slate-700">Time:</span>{" "}
                  {selectedTask.time}
                </p>
              ) : null}
              {selectedTask.value ? (
                <p className="mt-1">
                  <span className="font-medium text-slate-700">Value:</span>{" "}
                  {selectedTask.value}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </ActionDrawer>
    </div>
  );
}

function CxMetricCards() {
  const customers = useCustomerStore((s) => s.customers);
  const gmv = customers.reduce((sum, row) => sum + row.totalPurchaseValue, 0);
  const orders = customers.reduce((sum, row) => sum + row.totalOrders, 0);
  const aov = orders ? gmv / orders : 0;

  return (
    <>
      <SummaryCard
        title="Total Customers"
        value={customers.length}
        href={ROUTES.CUSTOMERS}
        icon={Users}
        accent="blue"
        hint="Customer directory"
      />
      <SummaryCard
        title="Avg Order Value"
        value={aov / 1_00_000}
        prefix="₹"
        suffix="L"
        decimals={1}
        href={ROUTES.CUSTOMER_ORDERS}
        icon={ShoppingCart}
        accent="emerald"
        hint="Customer orders"
      />
    </>
  );
}

const QUICK_ACTIONS = [
  {
    href: ROUTES.MARKETPLACE_CATALOG,
    label: "Add product",
    icon: Package,
    tone: "bg-[#1B6EF3] text-white shadow-sm hover:bg-[#1558C8] hover:shadow-md",
    iconWrap: "bg-white/20 text-white",
  },
  {
    href: ROUTES.MARKETPLACE_OFFERS,
    label: "Create offer",
    icon: Tag,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100",
    iconWrap: "bg-emerald-100 text-emerald-700",
  },
  {
    href: ROUTES.CUSTOMER_NOTIFICATIONS,
    label: "Create notification",
    icon: Bell,
    tone: "border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-300 hover:bg-amber-100",
    iconWrap: "bg-amber-100 text-amber-700",
  },
  {
    href: ROUTES.PROCUREMENT,
    label: "Review PR",
    icon: ClipboardList,
    tone: "border-sky-200 bg-sky-50 text-sky-800 hover:border-sky-300 hover:bg-sky-100",
    iconWrap: "bg-sky-100 text-sky-700",
  },
  {
    href: ROUTES.KYC,
    label: "Review KYC",
    icon: ShieldCheck,
    tone: "border-violet-200 bg-violet-50 text-violet-800 hover:border-violet-300 hover:bg-violet-100",
    iconWrap: "bg-violet-100 text-violet-700",
  },
] as const;

function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.label}
            href={action.href}
            className={`inline-flex items-center gap-2.5 rounded-xl border border-transparent px-4 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B6EF3] focus-visible:ring-offset-2 ${action.tone}`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${action.iconWrap}`}
            >
              <Icon className="h-4 w-4" />
            </span>
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}
