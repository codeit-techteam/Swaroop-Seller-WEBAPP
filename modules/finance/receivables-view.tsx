"use client";

import { useMemo } from "react";

import {
  OperationsShell,
  OpsStatusBadge,
  OpsTable,
} from "@/components/operations";
import { TableCell, TableRow } from "@/components/ui/table";
import { useClientTable } from "@/hooks/useClientTable";
import { cn, formatCompactInr } from "@/lib/utils";
import { financeSummaryMock } from "@/mock/finance";
import { useFinanceStore } from "@/store/financeStore";
import type { ReceivableRecord, ReceivableStatus } from "@/types/finance";

function collectionPercent(row: ReceivableRecord): number {
  if (row.amount <= 0) return 0;
  return Math.round(((row.amount - row.outstanding) / row.amount) * 100);
}

function agingTone(days: number, status: ReceivableStatus): string {
  if (status === "COLLECTED") return "bg-emerald-50 text-emerald-700";
  if (status === "OVERDUE" || days > 30) return "bg-red-50 text-red-700";
  if (days > 15) return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

function CollectionTrack({ row }: { row: ReceivableRecord }) {
  const percent = collectionPercent(row);
  const barClass =
    row.status === "OVERDUE"
      ? "bg-red-500"
      : row.status === "COLLECTED"
        ? "bg-emerald-500"
        : row.status === "PARTIAL"
          ? "bg-amber-500"
          : "bg-[#1B6EF3]";

  return (
    <div className="min-w-[140px] space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="font-medium text-slate-700">{percent}% collected</span>
        <span className="tabular-nums text-slate-400">
          {row.creditDays}d credit
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full transition-all", barClass)}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="truncate text-[11px] text-slate-400">
        {row.status === "COLLECTED"
          ? `Settled${row.lastPaymentAt ? ` · ${row.lastPaymentAt}` : ""}`
          : row.outstanding > 0
            ? `${formatCompactInr(row.outstanding)} due`
            : "Cleared"}
      </p>
    </div>
  );
}

export function ReceivablesView() {
  const receivables = useFinanceStore((s) => s.receivables);
  const searchFields = useMemo(
    () => (row: ReceivableRecord) => [
      row.invoiceId,
      row.customer,
      row.status,
    ],
    [],
  );
  const table = useClientTable({ rows: receivables, searchFields });
  const summary = financeSummaryMock;

  const insights = useMemo(() => {
    const openRows = receivables.filter((r) => r.status !== "COLLECTED");
    const overdueRows = receivables.filter((r) => r.status === "OVERDUE");
    const customers = new Set(openRows.map((r) => r.customer)).size;
    const avgAging =
      openRows.length === 0
        ? 0
        : Math.round(
            openRows.reduce((sum, r) => sum + r.agingDays, 0) / openRows.length,
          );

    const buckets = {
      current: receivables.filter(
        (r) => r.status !== "COLLECTED" && r.agingDays <= 15,
      ).length,
      mid: receivables.filter(
        (r) =>
          r.status !== "COLLECTED" && r.agingDays > 15 && r.agingDays <= 30,
      ).length,
      overdue: overdueRows.length,
      collected: receivables.filter((r) => r.status === "COLLECTED").length,
    };

    return { customers, avgAging, buckets, overdueCount: overdueRows.length };
  }, [receivables]);

  return (
    <OperationsShell
      className="space-y-6 py-6"
      title="Receivables"
      subtitle="Track customer credit receivables — outstanding balance, aging, and collection progress."
      kpis={[
        {
          title: "Total Receivables",
          value: summary.totalReceivables / 1_00_00_000,
          prefix: "₹",
          suffix: "Cr",
          decimals: 1,
        },
        {
          title: "Overdue Amount",
          value: summary.overdueAmount / 1_00_000,
          prefix: "₹",
          suffix: "L",
          decimals: 1,
          valueClassName: "text-red-600",
        },
        {
          title: "Customers with Dues",
          value: insights.customers,
          decimals: 0,
        },
        {
          title: "Avg Aging",
          value: insights.avgAging,
          suffix: "d",
          decimals: 0,
        },
      ]}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "0–15 days",
            hint: "Current credit",
            count: insights.buckets.current,
            tone: "border-slate-200 bg-white text-slate-800",
          },
          {
            label: "16–30 days",
            hint: "Watch list",
            count: insights.buckets.mid,
            tone: "border-amber-200 bg-amber-50/60 text-amber-900",
          },
          {
            label: "Overdue",
            hint: "Past due date",
            count: insights.buckets.overdue,
            tone: "border-red-200 bg-red-50/70 text-red-800",
          },
          {
            label: "Collected",
            hint: "Fully settled",
            count: insights.buckets.collected,
            tone: "border-emerald-200 bg-emerald-50/60 text-emerald-800",
          },
        ].map((bucket) => (
          <div
            key={bucket.label}
            className={cn(
              "rounded-xl border px-4 py-3.5 shadow-sm",
              bucket.tone,
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
              {bucket.label}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {bucket.count}
            </p>
            <p className="mt-0.5 text-xs opacity-60">{bucket.hint}</p>
          </div>
        ))}
      </div>

      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search invoice or customer"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={["ALL", "OPEN", "PARTIAL", "COLLECTED", "OVERDUE"]}
        headers={[
          "Invoice",
          "Customer",
          "Amount",
          "Outstanding",
          "Credit track",
          "Aging",
          "Due",
          "Status",
        ]}
        emptyTitle="No receivables found"
        emptyDescription="No customer receivables match the current filters."
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.filtered.length}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        rowCount={table.paginated.length}
      >
        {table.paginated.map((row) => (
          <TableRow
            key={row.id}
            className="transition-colors hover:bg-slate-50/80"
          >
            <TableCell className="px-4 py-4 font-medium text-[#1B6EF3]">
              {row.invoiceId}
            </TableCell>
            <TableCell className="px-4 py-4">
              <p className="font-medium text-slate-800">{row.customer}</p>
              <p className="text-xs text-slate-400">
                {row.creditDays}-day credit terms
              </p>
            </TableCell>
            <TableCell className="px-4 py-4 tabular-nums font-semibold text-slate-900">
              {formatCompactInr(row.amount)}
            </TableCell>
            <TableCell
              className={cn(
                "px-4 py-4 tabular-nums font-semibold",
                row.outstanding > 0 ? "text-slate-900" : "text-emerald-600",
              )}
            >
              {formatCompactInr(row.outstanding)}
            </TableCell>
            <TableCell className="px-4 py-4">
              <CollectionTrack row={row} />
            </TableCell>
            <TableCell className="px-4 py-4">
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
                  agingTone(row.agingDays, row.status),
                )}
              >
                {row.agingDays}d
              </span>
            </TableCell>
            <TableCell className="px-4 py-4 tabular-nums text-slate-600">
              {row.dueDate}
            </TableCell>
            <TableCell className="px-4 py-4">
              <OpsStatusBadge status={row.status} />
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>
    </OperationsShell>
  );
}
