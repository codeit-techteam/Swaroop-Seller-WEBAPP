"use client";

import Link from "next/link";
import { useMemo } from "react";

import { OperationsShell, OpsStatusBadge, OpsTable } from "@/components/operations";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useClientTable } from "@/hooks/useClientTable";
import { ROUTES } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import { useWorkbench } from "@/modules/procurement/use-workbench";

export function ProcurementDocumentsView() {
  const { items, isSeller } = useWorkbench();
  const rows = useMemo(() => {
    return items.flatMap((item) =>
      (item.documents ?? [])
        .filter((doc) => !isSeller || doc.visibleToSeller)
        .map((doc) => ({
          id: doc.id,
          name: doc.name,
          kind: doc.kind,
          uploadedAt: doc.uploadedAt,
          requestId: item.requestId,
          supplier: item.supplier,
          status: doc.kind,
        })),
    );
  }, [isSeller, items]);
  const searchFields = useMemo(
    () => (row: (typeof rows)[number]) => [row.name, row.requestId, row.kind, row.supplier],
    [],
  );
  const table = useClientTable({ rows, searchFields });

  return (
    <OperationsShell
      title="Procurement Documents"
      subtitle={
        isSeller
          ? "RFQs, your quotations, POs and shipping files assigned to you."
          : "Customer PR, RFQ, quotations, commercial, compliance, PO and shipping files."
      }
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search document, PR or type"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={["ALL", "CUSTOMER_PR", "RFQ", "QUOTATION", "PO", "SHIPPING", "COMPLIANCE"]}
        headers={["Document", "Type", "PR / PO", "Uploaded", "Action"]}
        emptyTitle="No documents"
        emptyDescription="Documents appear as the procurement lifecycle advances."
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.filtered.length}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        rowCount={table.paginated.length}
      >
        {table.paginated.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell className="font-medium">{doc.name}</TableCell>
            <TableCell>
              <OpsStatusBadge status={doc.kind} />
            </TableCell>
            <TableCell>{doc.requestId}</TableCell>
            <TableCell>{formatDateTime(doc.uploadedAt)}</TableCell>
            <TableCell>
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs" asChild>
                <Link href={`${ROUTES.PROCUREMENT_PURCHASE_REQUESTS}/${doc.requestId}`}>
                  Open record
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>
      <p className="text-xs text-slate-500">
        Last generated {formatDate(new Date().toISOString())}. Internal commercial files stay admin-only.
      </p>
    </OperationsShell>
  );
}
