"use client";

import Link from "next/link";
import { useMemo } from "react";

import { OperationsShell, OpsStatusBadge, OpsTable } from "@/components/operations";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useClientTable } from "@/hooks/useClientTable";
import { ROUTES } from "@/lib/constants";
import { formatCompactInr, formatDateTime, formatNumber } from "@/lib/utils";
import { useWorkbench } from "@/modules/procurement/use-workbench";
import type { ProcurementItem } from "@/types/procurement";

export function NegotiationListView() {
  const { items } = useWorkbench();
  const rows = useMemo(
    () =>
      items.filter(
        (item) =>
          item.type === "PR" &&
          (item.status === "NEGOTIATION" ||
            item.negotiationStatus === "ACTIVE" ||
            item.negotiation.length > 0),
      ),
    [items],
  );
  const searchFields = useMemo(
    () => (row: ProcurementItem) => [
      row.requestId,
      row.buyer,
      row.supplier,
      row.commodity,
      row.grade,
    ],
    [],
  );
  const table = useClientTable({ rows, searchFields });

  return (
    <OperationsShell
      title="Price Negotiation"
      subtitle="Admin negotiates with the selected seller. Customers never see this workspace."
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search PR, seller, material"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={["ALL", "NEGOTIATION", "APPROVAL_PENDING"]}
        headers={[
          "Negotiation ID",
          "PR ID",
          "Seller",
          "Material",
          "Original Price",
          "Latest Price",
          "Quantity",
          "Total Value",
          "Last Updated",
          "Status",
          "Action",
        ]}
        emptyTitle="No active negotiations"
        emptyDescription="Select a seller from comparison to start negotiating."
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.filtered.length}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        rowCount={table.paginated.length}
      >
        {table.paginated.map((item) => {
          const first = item.negotiation[0];
          const last = item.negotiation[item.negotiation.length - 1];
          return (
            <TableRow key={item.id}>
              <TableCell className="font-medium">NEG-{item.requestId.replace("PR-", "")}</TableCell>
              <TableCell>{item.requestId}</TableCell>
              <TableCell>{item.supplier}</TableCell>
              <TableCell>
                {item.commodity} {item.grade}
              </TableCell>
              <TableCell>₹{formatNumber(first?.unitPrice ?? item.unitPrice)}</TableCell>
              <TableCell>₹{formatNumber(last?.unitPrice ?? item.unitPrice)}</TableCell>
              <TableCell>
                {formatNumber(item.quantityMt)} {item.quantityUnit}
              </TableCell>
              <TableCell>{formatCompactInr(item.negotiatedValue)}</TableCell>
              <TableCell>
                {formatDateTime(last?.createdAt ?? item.createdAt)}
              </TableCell>
              <TableCell>
                <OpsStatusBadge status={item.negotiationStatus ?? item.status} />
              </TableCell>
              <TableCell>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" asChild>
                  <Link href={`${ROUTES.PROCUREMENT_NEGOTIATION}/${item.requestId}`}>
                    Open
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </OpsTable>
    </OperationsShell>
  );
}
