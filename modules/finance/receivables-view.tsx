"use client";

import { useMemo } from "react";

import {
  OperationsShell,
  OpsStatusBadge,
  OpsTable,
} from "@/components/operations";
import { TableCell, TableRow } from "@/components/ui/table";
import { useClientTable } from "@/hooks/useClientTable";
import { formatCompactInr } from "@/lib/utils";
import { financeSummaryMock } from "@/mock/finance";
import { useFinanceStore } from "@/store/financeStore";

export function ReceivablesView() {
  const receivables = useFinanceStore((s) => s.receivables);
  const searchFields = useMemo(
    () => (row: (typeof receivables)[number]) => [row.invoiceId, row.buyer],
    [],
  );
  const table = useClientTable({ rows: receivables, searchFields });
  const summary = financeSummaryMock;

  return (
    <OperationsShell
      title="Receivables"
      subtitle="Buyer outstanding, aging and collection status for marketplace invoices."
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
      ]}
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search invoice or buyer"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={["ALL", "OPEN", "PARTIAL", "COLLECTED", "OVERDUE"]}
        headers={[
          "Invoice",
          "Buyer",
          "Amount",
          "Outstanding",
          "Aging",
          "Due",
          "Status",
        ]}
        emptyTitle="No overdue payments"
        emptyDescription="No receivables match the current filters."
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
              {row.invoiceId}
            </TableCell>
            <TableCell>{row.buyer}</TableCell>
            <TableCell className="tabular-nums">
              {formatCompactInr(row.amount)}
            </TableCell>
            <TableCell className="tabular-nums">
              {formatCompactInr(row.outstanding)}
            </TableCell>
            <TableCell>{row.agingDays}d</TableCell>
            <TableCell>{row.dueDate}</TableCell>
            <TableCell>
              <OpsStatusBadge status={row.status} />
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>
    </OperationsShell>
  );
}
