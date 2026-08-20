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
  Plus,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Truck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import toast from "react-hot-toast";

import {
  ActionDrawer,
  ActivityCard,
  ErpPagination,
  ExportDropdown,
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
import { useProcurementStore } from "@/store/procurementStore";
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
          <Button asChild className="bg-[#0B1F3A] hover:bg-[#122846]">
            <Link href={ROUTES.CUSTOMERS}>
              <Plus className="h-4 w-4" />
              Add customer
            </Link>
          </Button>
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
          <ExportDropdown />
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
          title="Active Offers"
          value={metrics.activeOffers}
          href={ROUTES.OFFERS}
          icon={Tag}
          accent="emerald"
          hint="Live on marketplace"
        />
        <SummaryCard
          title="Pending Requests"
          value={metrics.pendingRequests}
          decimals={0}
          prefix=""
          href={ROUTES.PURCHASE_REQUESTS}
          icon={ClipboardList}
          accent="amber"
          hint="Awaiting action"
        />
        <SummaryCard
          title="Active Orders"
          value={metrics.activeOrders}
          href={ROUTES.ORDERS}
          icon={ShoppingCart}
          accent="blue"
          hint="In progress"
        />
        <SummaryCard
          title="Pending Settlement"
          value={metrics.pendingSettlement}
          prefix="₹"
          suffix="Cr"
          decimals={1}
          href={ROUTES.PAYMENTS}
          icon={Wallet}
          accent="rose"
          hint="Finance queue"
        />
        <SummaryCard
          title="Dispatch Pending"
          value={metrics.dispatchPending}
          href={ROUTES.DISPATCH}
          icon={Truck}
          accent="amber"
          hint="Ready to move"
        />
      </div>

      <CxExperienceStrip />

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

function CxExperienceStrip() {
  const customers = useCustomerStore((s) => s.customers);
  const prs = useProcurementStore((s) => s.items);
  const pendingKyc = customers.filter(
    (row) => row.kycStatus === "PENDING" || row.kycStatus === "UNDER_REVIEW",
  ).length;
  const gmv = customers.reduce((sum, row) => sum + row.totalPurchaseValue, 0);
  const orders = customers.reduce((sum, row) => sum + row.totalOrders, 0);
  const aov = orders ? gmv / orders : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">
          Customer experience
        </h2>
        <Link
          href={ROUTES.CUSTOMERS}
          className="text-sm font-medium text-[#1B6EF3] hover:underline"
        >
          Open directory
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <SummaryCard
          title="Total customers"
          value={customers.length}
          href={ROUTES.CUSTOMERS}
          icon={Users}
          accent="blue"
          hint="Customer directory"
        />
        <SummaryCard
          title="Active customers"
          value={
            customers.filter((row) => row.accountStatus === "ACTIVE").length
          }
          href={`${ROUTES.CUSTOMERS}?status=ACTIVE`}
          icon={Users}
          accent="emerald"
          hint="Live accounts"
        />
        <SummaryCard
          title="Pending KYC"
          value={pendingKyc}
          href={`${ROUTES.KYC}?status=PENDING`}
          icon={ShieldCheck}
          accent="amber"
          hint="Awaiting verification"
        />
        <SummaryCard
          title="Pending PRs"
          value={
            prs.filter(
              (row) => row.status === "NEW" || row.status === "UNDER_REVIEW",
            ).length
          }
          href={`${ROUTES.CUSTOMER_REQUESTS}?status=NEW`}
          icon={ClipboardList}
          accent="blue"
          hint="Customer purchase requests"
        />
        <SummaryCard
          title="Avg order value"
          value={aov / 1_00_000}
          prefix="₹"
          suffix="L"
          decimals={1}
          href={ROUTES.CUSTOMER_ORDERS}
          icon={ShoppingCart}
          accent="emerald"
          hint="Customer orders"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.MARKETPLACE_CATALOG}>
            <Package className="h-3.5 w-3.5" />
            Add product
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.MARKETPLACE_OFFERS}>
            <Tag className="h-3.5 w-3.5" />
            Create offer
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.CUSTOMER_NOTIFICATIONS}>
            <Bell className="h-3.5 w-3.5" />
            Create notification
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.PROCUREMENT}>
            <ClipboardList className="h-3.5 w-3.5" />
            Review PR
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.KYC}>
            <ShieldCheck className="h-3.5 w-3.5" />
            Review KYC
          </Link>
        </Button>
      </div>
    </div>
  );
}
