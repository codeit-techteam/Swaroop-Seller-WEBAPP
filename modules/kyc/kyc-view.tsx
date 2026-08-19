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
import { kycRecordsMock } from "@/mock/kyc";

export function KycView() {
  const searchFields = useMemo(
    () => (row: (typeof kycRecordsMock)[number]) => [
      row.entity,
      row.document,
      row.status,
    ],
    [],
  );
  const table = useClientTable({ rows: kycRecordsMock, searchFields });

  return (
    <OperationsShell
      title="KYC Desk"
      subtitle="Buyer, seller and operations user verification with mock document status."
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search entity or document"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={[
          "ALL",
          "VERIFIED",
          "PENDING",
          "EXPIRED",
          "REJECTED",
          "UNDER_REVIEW",
        ]}
        headers={[
          "Entity",
          "Type",
          "Document",
          "Submitted",
          "Expires",
          "Reviewer",
          "Status",
          "Action",
        ]}
        emptyTitle="No compliance documents"
        emptyDescription="No KYC records match the selected filters."
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.filtered.length}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        rowCount={table.paginated.length}
      >
        {table.paginated.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.entity}</TableCell>
            <TableCell>{row.entityType}</TableCell>
            <TableCell>{row.document}</TableCell>
            <TableCell>{row.submittedAt}</TableCell>
            <TableCell>{row.expiresAt}</TableCell>
            <TableCell>{row.reviewer}</TableCell>
            <TableCell>
              <OpsStatusBadge status={row.status} />
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => toast.success(`${row.document} approved (mock)`)}
              >
                Approve
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>
    </OperationsShell>
  );
}
