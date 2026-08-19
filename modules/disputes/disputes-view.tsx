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
import { disputesMock } from "@/mock/disputes";

export function DisputesView() {
  const searchFields = useMemo(
    () => (row: (typeof disputesMock)[number]) => [
      row.disputeId,
      row.orderId,
      row.raisedBy,
      row.category,
    ],
    [],
  );
  const table = useClientTable({ rows: disputesMock, searchFields });

  return (
    <OperationsShell
      title="Disputes"
      subtitle="Quality, quantity, payment and logistics disputes across live orders."
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search dispute, order or party"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={[
          "ALL",
          "OPEN",
          "UNDER_REVIEW",
          "AWAITING_EVIDENCE",
          "RESOLVED",
          "REJECTED",
        ]}
        headers={[
          "Dispute",
          "Order",
          "Category",
          "Raised by",
          "Amount",
          "SLA",
          "Status",
          "Action",
        ]}
        emptyTitle="No disputes found"
        emptyDescription="There are no disputes matching the current filters."
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
              {row.disputeId}
            </TableCell>
            <TableCell>{row.orderId}</TableCell>
            <TableCell>{row.category}</TableCell>
            <TableCell>{row.raisedBy}</TableCell>
            <TableCell className="tabular-nums">
              {formatCompactInr(row.amount)}
            </TableCell>
            <TableCell>{row.slaHours}h</TableCell>
            <TableCell>
              <OpsStatusBadge status={row.status} />
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => toast.success(`${row.disputeId} resolved (mock)`)}
              >
                Resolve
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>
    </OperationsShell>
  );
}
