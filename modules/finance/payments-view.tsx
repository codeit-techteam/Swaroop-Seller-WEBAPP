"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Route } from "lucide-react";

import {
  PaymentDrawer,
  PaymentModeBadge,
  PaymentModeFilter,
  PaymentTrackInline,
} from "@/components/finance";
import {
  OperationsShell,
  OpsStatusBadge,
  OpsTable,
} from "@/components/operations";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useClientTable } from "@/hooks/useClientTable";
import { formatCompactInr } from "@/lib/utils";
import { financeSummaryMock } from "@/mock/finance";
import { useFinanceStore } from "@/store/financeStore";
import type { PaymentMode, PaymentRecord } from "@/types/finance";

const PAYMENT_STATUSES = [
  "ALL",
  "PENDING",
  "PROCESSING",
  "SETTLED",
  "OVERDUE",
  "FAILED",
];

export function PaymentsView() {
  const payments = useFinanceStore((s) => s.payments);
  const markPayment = useFinanceStore((s) => s.markPayment);
  const [modeFilter, setModeFilter] = useState<PaymentMode | "ALL">("ALL");
  const [selected, setSelected] = useState<PaymentRecord | null>(null);

  const modeCounts = useMemo(() => {
    const counts: Record<PaymentMode | "ALL", number> = {
      ALL: payments.length,
      ADVANCE: 0,
      ON_LOADING: 0,
      ON_DELIVERY: 0,
      CREDIT: 0,
    };
    for (const payment of payments) {
      counts[payment.mode] += 1;
    }
    return counts;
  }, [payments]);

  const modeFiltered = useMemo(
    () =>
      modeFilter === "ALL"
        ? payments
        : payments.filter((row) => row.mode === modeFilter),
    [modeFilter, payments],
  );

  const searchFields = useMemo(
    () => (row: PaymentRecord) => [
      row.paymentId,
      row.orderId,
      row.counterparty,
      row.mode,
    ],
    [],
  );
  const table = useClientTable({ rows: modeFiltered, searchFields });
  const summary = financeSummaryMock;

  const handleMarkSettled = (id: string) => {
    markPayment(id, "SETTLED");
    const payment = payments.find((p) => p.id === id);
    toast.success(`${payment?.paymentId ?? "Payment"} marked settled`);
    setSelected((current) =>
      current?.id === id ? { ...current, status: "SETTLED" } : current,
    );
  };

  return (
    <>
      <OperationsShell
        title="Payments"
        subtitle="Track advance, on-loading, on-delivery, and credit settlements across the marketplace."
        kpis={[
          {
            title: "Pending Payments",
            value: summary.pendingPayments / 1_00_000,
            prefix: "₹",
            suffix: "L",
            decimals: 0,
          },
          {
            title: "Settled Amount",
            value: summary.settledAmount / 1_00_00_000,
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
            title: "Credit Exposure",
            value: summary.creditExposure / 1_00_00_000,
            prefix: "₹",
            suffix: "Cr",
            decimals: 1,
          },
        ]}
      >
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Payment mode
          </p>
          <PaymentModeFilter
            value={modeFilter}
            onChange={(mode) => {
              setModeFilter(mode);
              table.setPage(1);
            }}
            counts={modeCounts}
          />
        </div>

        <OpsTable
          search={table.search}
          onSearch={table.setSearch}
          searchPlaceholder="Search payment, order or counterparty"
          status={table.status}
          onStatusChange={table.setStatus}
          statusOptions={PAYMENT_STATUSES}
          headers={[
            "Payment ID",
            "Order",
            "Counterparty",
            "Amount",
            "Mode",
            "Track",
            "Due",
            "Status",
            "Action",
          ]}
          emptyTitle="No payments found"
          emptyDescription="No payment records match the selected mode or status filters."
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
              className="cursor-pointer transition-colors hover:bg-slate-50/80"
              onClick={() => setSelected(row)}
            >
              <TableCell>
                <button
                  type="button"
                  className="font-medium text-[#1B6EF3] hover:underline"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelected(row);
                  }}
                >
                  {row.paymentId}
                </button>
              </TableCell>
              <TableCell className="text-slate-700">{row.orderId}</TableCell>
              <TableCell className="font-medium text-slate-800">
                {row.counterparty}
              </TableCell>
              <TableCell className="tabular-nums font-semibold text-slate-900">
                {formatCompactInr(row.amount)}
              </TableCell>
              <TableCell>
                <PaymentModeBadge
                  mode={row.mode}
                  creditDays={row.creditDays}
                />
              </TableCell>
              <TableCell>
                <PaymentTrackInline track={row.track} />
              </TableCell>
              <TableCell className="tabular-nums text-slate-600">
                {row.dueDate}
              </TableCell>
              <TableCell>
                <OpsStatusBadge status={row.status} />
              </TableCell>
              <TableCell>
                <div
                  className="flex items-center gap-2"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-xs"
                    onClick={() => setSelected(row)}
                  >
                    <Route className="h-3 w-3" />
                    Track
                  </Button>
                  {row.status !== "SETTLED" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleMarkSettled(row.id)}
                    >
                      Mark settled
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </OpsTable>
      </OperationsShell>

      <PaymentDrawer
        open={Boolean(selected)}
        payment={
          selected
            ? (payments.find((p) => p.id === selected.id) ?? selected)
            : null
        }
        onClose={() => setSelected(null)}
        onMarkSettled={(id) => {
          handleMarkSettled(id);
          setSelected(null);
        }}
      />
    </>
  );
}
