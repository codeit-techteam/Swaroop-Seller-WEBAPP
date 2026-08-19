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
import { reportsMock } from "@/mock/reports";

export function ReportsView() {
  const searchFields = useMemo(
    () => (row: (typeof reportsMock)[number]) => [row.name, row.module, row.owner],
    [],
  );
  const table = useClientTable({ rows: reportsMock, searchFields });

  return (
    <OperationsShell
      title="Reports"
      subtitle="Generate and download operations packs. Files are simulated."
      actions={
        <Button
          className="bg-[#0B1F3A] hover:bg-[#122846]"
          onClick={() => toast.success("Report generation queued (mock)")}
        >
          Generate report
        </Button>
      }
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search report or owner"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={["ALL", "READY", "GENERATING", "FAILED"]}
        headers={["Report", "Module", "Period", "Owner", "Generated", "Status", "Action"]}
        emptyTitle="No reports"
        emptyDescription="No reports match the current filters."
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.filtered.length}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        rowCount={table.paginated.length}
      >
        {table.paginated.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell>{row.module}</TableCell>
            <TableCell>{row.period}</TableCell>
            <TableCell>{row.owner}</TableCell>
            <TableCell>{row.generatedAt.slice(0, 10)}</TableCell>
            <TableCell>
              <OpsStatusBadge status={row.status} />
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => toast.success(`${row.name} downloaded (mock)`)}
              >
                Download
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>
    </OperationsShell>
  );
}
