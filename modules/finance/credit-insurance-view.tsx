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

export function CreditInsuranceView() {
  const policies = useFinanceStore((s) => s.policies);
  const searchFields = useMemo(
    () => (row: (typeof policies)[number]) => [
      row.policyId,
      row.buyer,
      row.insurer,
    ],
    [],
  );
  const table = useClientTable({ rows: policies, searchFields });
  const summary = financeSummaryMock;

  return (
    <OperationsShell
      title="Credit Insurance"
      subtitle="Buyer cover limits, utilization and policy health. Mock data only."
      kpis={[
        {
          title: "Credit Exposure",
          value: summary.creditExposure / 1_00_00_000,
          prefix: "₹",
          suffix: "Cr",
          decimals: 1,
        },
      ]}
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search policy, buyer or insurer"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={["ALL", "ACTIVE", "UNDER_REVIEW", "EXHAUSTED", "EXPIRED"]}
        headers={[
          "Policy",
          "Buyer",
          "Insurer",
          "Cover",
          "Utilized",
          "Valid until",
          "Status",
        ]}
        emptyTitle="No credit policies"
        emptyDescription="No credit insurance policies match the filters."
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
              {row.policyId}
            </TableCell>
            <TableCell>{row.buyer}</TableCell>
            <TableCell>{row.insurer}</TableCell>
            <TableCell className="tabular-nums">
              {formatCompactInr(row.coverAmount)}
            </TableCell>
            <TableCell className="tabular-nums">
              {formatCompactInr(row.utilized)}
            </TableCell>
            <TableCell>{row.validUntil}</TableCell>
            <TableCell>
              <OpsStatusBadge status={row.status} />
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>
    </OperationsShell>
  );
}
