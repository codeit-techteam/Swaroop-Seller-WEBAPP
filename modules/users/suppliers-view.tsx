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
import { useUsersStore } from "@/store/usersStore";

export function SuppliersView() {
  const suppliers = useUsersStore((s) => s.suppliers);
  const searchFields = useMemo(
    () => (row: (typeof suppliers)[number]) => [
      row.name,
      row.gstin,
      row.location,
      row.commodities,
    ],
    [],
  );
  const table = useClientTable({ rows: suppliers, searchFields });

  return (
    <OperationsShell
      title="Sellers / Suppliers"
      subtitle="Supplier directory for operations. KYC and credit limits are mock values."
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search supplier, GSTIN or location"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={["ALL", "ACTIVE", "ONBOARDING", "HOLD", "INACTIVE"]}
        headers={[
          "Supplier",
          "Location",
          "Commodities",
          "KYC",
          "Credit limit",
          "Status",
          "Action",
        ]}
        emptyTitle="No suppliers found"
        emptyDescription="No seller records match the current filters."
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.filtered.length}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        rowCount={table.paginated.length}
      >
        {table.paginated.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <p className="font-medium text-slate-800">{row.name}</p>
              <p className="text-xs text-slate-400">{row.gstin}</p>
            </TableCell>
            <TableCell>{row.location}</TableCell>
            <TableCell>{row.commodities}</TableCell>
            <TableCell>
              <OpsStatusBadge status={row.kyc} />
            </TableCell>
            <TableCell className="tabular-nums">
              {formatCompactInr(row.creditLimit)}
            </TableCell>
            <TableCell>
              <OpsStatusBadge status={row.status} />
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => toast.success(`${row.name} opened (mock)`)}
              >
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>
    </OperationsShell>
  );
}
