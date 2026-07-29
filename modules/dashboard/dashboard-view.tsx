"use client";

import {
  Download,
  FileText,
  Filter,
  MoreHorizontal,
  PackagePlus,
  Plus,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import {
  ActionCard,
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
import { formatCurrency } from "@/lib/utils";
import { useDashboardStore } from "@/store/dashboardStore";

function greetingForHour(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function DashboardView() {
  const seller = useDashboardStore((s) => s.seller);
  const metrics = useDashboardStore((s) => s.metrics);
  const priorityTasks = useDashboardStore((s) => s.priorityTasks);
  const activityLogs = useDashboardStore((s) => s.activityLogs);
  const search = useDashboardStore((s) => s.search);
  const filters = useDashboardStore((s) => s.filters);
  const sortKey = useDashboardStore((s) => s.sortKey);
  const sortDirection = useDashboardStore((s) => s.sortDirection);
  const page = useDashboardStore((s) => s.transactionPage);
  const pageSize = useDashboardStore((s) => s.pageSize);
  const setPage = useDashboardStore((s) => s.setTransactionPage);
  const setSort = useDashboardStore((s) => s.setSort);
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

  void search;
  void filters;
  void sortKey;
  void sortDirection;
  void page;

  const filtered = getFilteredTransactions();
  const transactions = getPaginatedTransactions();
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const urgentCount = priorityTasks.filter((task) => task.urgent).length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {greetingForHour()}, {seller.role}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Live metrics for {seller.company} - {seller.warehouse}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 border-slate-200 bg-white"
            onClick={() => setFilterDrawerOpen(true)}
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <ExportDropdown />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          title="Available Inventory"
          value={metrics.availableInventory}
          suffix={metrics.availableInventoryUnit}
        />
        <SummaryCard title="Active Offers" value={metrics.activeOffers} />
        <SummaryCard
          title="Pending Requests"
          value={metrics.pendingRequests}
          decimals={0}
          prefix=""
        />
        <SummaryCard
          title="Pending Settlement"
          value={metrics.pendingSettlement}
          prefix="₹"
          suffix="Cr"
          decimals={1}
        />
        <SummaryCard title="Dispatch Pending" value={metrics.dispatchPending} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Recent Transactions
          </h2>
          <Link
            href={ROUTES.ORDERS}
            className="text-sm font-medium text-[#1B6EF3] hover:underline"
          >
            View All Activity
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead
                className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                onClick={() => setSort("orderId")}
              >
                Order ID
              </TableHead>
              <TableHead
                className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                onClick={() => setSort("commodity")}
              >
                Commodity
              </TableHead>
              <TableHead
                className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                onClick={() => setSort("value")}
              >
                Value (USD)
              </TableHead>
              <TableHead
                className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                onClick={() => setSort("status")}
              >
                Status
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
                <TableCell className="tabular-nums text-slate-700">
                  {formatCurrency(txn.value)}
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
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => toast.success(`Viewing #${txn.orderId}`)}
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
          showingLabel={`Showing ${transactions.length} of 248 entries`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              Today&apos;s Priority Tasks
            </h3>
            <StatusChip label={`${urgentCount} URGENT`} variant="urgent" />
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

        <ActivityCard logs={activityLogs.slice(0, 4)} />

        <div className="rounded-xl bg-[#0B1F3A] p-4 text-white shadow-sm">
          <h3 className="text-sm font-semibold">Command Center</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <ActionCard
              label="Create Offer"
              icon={Plus}
              href={ROUTES.OFFERS}
              onClick={() => toast.success("Create Offer opened")}
            />
            <ActionCard
              label="Update Stock"
              icon={PackagePlus}
              href={ROUTES.INVENTORY}
              onClick={() => toast.success("Update Stock opened")}
            />
            <ActionCard
              label="Upload KYC"
              icon={FileText}
              href={ROUTES.DOCUMENTS}
              onClick={() => toast.success("Upload KYC opened")}
            />
            <ActionCard
              label="Reports"
              icon={Download}
              href={ROUTES.PERFORMANCE_DASHBOARD}
              onClick={() => toast.success("Reports opened")}
            />
          </div>
        </div>
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
