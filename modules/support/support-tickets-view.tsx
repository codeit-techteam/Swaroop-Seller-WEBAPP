"use client";

import Link from "next/link";
import { useMemo } from "react";

import {
  OperationsShell,
  OpsStatusBadge,
  OpsTable,
} from "@/components/operations";
import { TableCell, TableRow } from "@/components/ui/table";
import { useClientTable } from "@/hooks/useClientTable";
import { ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { useCxOpsStore } from "@/store/cxOpsStore";
import type { SupportTicket } from "@/types/cx-ops";

export function SupportTicketsView() {
  const tickets = useCxOpsStore((s) => s.tickets);
  const searchFields = useMemo(
    () => (row: SupportTicket) => [
      row.ticketId,
      row.customerName,
      row.subject,
      row.orderId ?? "",
    ],
    [],
  );
  const table = useClientTable({
    rows: tickets,
    searchFields,
    getStatus: (row) => row.status,
  });

  return (
    <OperationsShell
      title="Customer support"
      subtitle="Tickets from Customer APP/WEB. Conversation stays on this desk."
      kpis={[
        {
          title: "Open",
          value: tickets.filter(
            (row) => row.status === "OPEN" || row.status === "IN_PROGRESS",
          ).length,
        },
        {
          title: "Waiting",
          value: tickets.filter((row) => row.status === "WAITING_FOR_CUSTOMER")
            .length,
        },
      ]}
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search tickets"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={[
          "ALL",
          "OPEN",
          "IN_PROGRESS",
          "WAITING_FOR_CUSTOMER",
          "RESOLVED",
          "CLOSED",
        ]}
        headers={[
          "Ticket",
          "Customer",
          "Order",
          "Category",
          "Priority",
          "Status",
          "Agent",
          "Updated",
        ]}
        emptyTitle="No tickets"
        emptyDescription="No support tickets match this filter."
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
              <Link
                href={`${ROUTES.CUSTOMER_SUPPORT}/${row.id}`}
                className="font-medium text-[#1B6EF3] hover:underline"
              >
                {row.ticketId}
              </Link>
            </TableCell>
            <TableCell>{row.customerName}</TableCell>
            <TableCell>{row.orderId ?? "—"}</TableCell>
            <TableCell>{row.category}</TableCell>
            <TableCell>
              <OpsStatusBadge status={row.priority} />
            </TableCell>
            <TableCell>
              <OpsStatusBadge status={row.status} />
            </TableCell>
            <TableCell>{row.assignedAgent}</TableCell>
            <TableCell>{formatDate(row.updatedAt)}</TableCell>
          </TableRow>
        ))}
      </OpsTable>
    </OperationsShell>
  );
}
