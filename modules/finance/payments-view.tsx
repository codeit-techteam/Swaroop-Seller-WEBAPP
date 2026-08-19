"use client";

import { useMemo } from "react";
import toast from "react-hot-toast";

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
  const searchFields = useMemo(
    () => (row: (typeof payments)[number]) => [
      row.paymentId,
      row.orderId,
      row.counterparty,
    ],
    [],
  );
  const table = useClientTable({ rows: payments, searchFields });
  const summary = financeSummaryMock;

  return (
    <OperationsShell
      title="Payments"
      subtitle="Track inbound and outbound settlement payments across the marketplace."
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
      ]}
    >
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
          "Due",
          "Status",
          "Action",
        ]}
        emptyTitle="No overdue payments"
        emptyDescription="No payment records match the selected filters."
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.filtered.length}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        rowCount={table.paginated.length}
      >
        {table.paginated.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium text-[#1B6EF3]">
              {row.paymentId}
            </TableCell>
            <TableCell>{row.orderId}</TableCell>
            <TableCell>{row.counterparty}</TableCell>
            <TableCell className="tabular-nums">
              {formatCompactInr(row.amount)}
            </TableCell>
            <TableCell>{row.mode}</TableCell>
            <TableCell>{row.dueDate}</TableCell>
            <TableCell>
              <OpsStatusBadge status={row.status} />
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => {
                  markPayment(row.id, "SETTLED");
                  toast.success(`${row.paymentId} marked settled (mock)`);
                }}
              >
                Mark settled
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>
    </OperationsShell>
  );
}
