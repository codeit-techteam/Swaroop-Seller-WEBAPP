"use client";

import { useEffect, useMemo } from "react";

import { OperationsShell, OpsTable } from "@/components/operations";
import { TableCell, TableRow } from "@/components/ui/table";
import { useClientTable } from "@/hooks/useClientTable";
import { formatDateTime } from "@/lib/utils";
import { auditService } from "@/services/cxOpsService";
import { useCxOpsStore } from "@/store/cxOpsStore";
import type { AuditLogEntry } from "@/types/cx-ops";

export function AuditLogsView() {
  const logs = useCxOpsStore((s) => s.auditLogs);
  useEffect(() => {
    void auditService.list().then((auditLogs) => {
      useCxOpsStore.setState({ auditLogs });
    });
  }, []);
  const searchFields = useMemo(
    () => (row: AuditLogEntry) => [
      row.actor,
      row.action,
      row.entity,
      row.entityId,
      row.newValue ?? "",
    ],
    [],
  );
  const table = useClientTable({
    rows: logs,
    searchFields,
    getStatus: (row) => row.action,
  });

  return (
    <OperationsShell
      title="Audit logs"
      subtitle="Who changed prices, KYC, CMS, offers, customers and payments."
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search actor, action or entity"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={[
          "ALL",
          ...Array.from(new Set(logs.map((row) => row.action))),
        ]}
        headers={[
          "When",
          "Actor",
          "Role",
          "Action",
          "Entity",
          "Old",
          "New",
          "IP",
        ]}
        emptyTitle="No audit events"
        emptyDescription="Actions will appear here as the control center is used."
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.filtered.length}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        rowCount={table.paginated.length}
      >
        {table.paginated.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{formatDateTime(row.at)}</TableCell>
            <TableCell>{row.actor}</TableCell>
            <TableCell>{row.role}</TableCell>
            <TableCell className="font-medium">{row.action}</TableCell>
            <TableCell>
              {row.entity} · {row.entityId}
            </TableCell>
            <TableCell className="text-xs text-slate-500">
              {row.oldValue ?? "—"}
            </TableCell>
            <TableCell className="text-xs text-slate-500">
              {row.newValue ?? "—"}
            </TableCell>
            <TableCell className="text-xs text-slate-400">
              {row.ip ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>
    </OperationsShell>
  );
}
