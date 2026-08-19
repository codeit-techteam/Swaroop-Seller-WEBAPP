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
import { formatNumber } from "@/lib/utils";
import { inventoryReservationsMock } from "@/mock/reservations";

export function InventoryReservationsView() {
  const searchFields = useMemo(
    () => (row: (typeof inventoryReservationsMock)[number]) => [
      row.reservationId,
      row.product,
      row.warehouse,
      row.orderId,
    ],
    [],
  );
  const table = useClientTable({
    rows: inventoryReservationsMock,
    searchFields,
  });

  return (
    <OperationsShell
      title="Inventory Reservations"
      subtitle="Stock reserved against live orders. Release and consume actions are mock."
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search reservation, product or order"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={["ALL", "ACTIVE", "RELEASED", "CONSUMED", "EXPIRED"]}
        headers={[
          "Reservation",
          "Product",
          "Warehouse",
          "Qty",
          "Order",
          "Until",
          "Status",
          "Action",
        ]}
        emptyTitle="No reservations"
        emptyDescription="No inventory reservations match the filters."
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
              {row.reservationId}
            </TableCell>
            <TableCell>{row.product}</TableCell>
            <TableCell>{row.warehouse}</TableCell>
            <TableCell className="tabular-nums">
              {formatNumber(row.quantityMt)} MT
            </TableCell>
            <TableCell>{row.orderId}</TableCell>
            <TableCell>{row.reservedUntil}</TableCell>
            <TableCell>
              <OpsStatusBadge status={row.status} />
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => toast.success(`${row.reservationId} released (mock)`)}
              >
                Release
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>
    </OperationsShell>
  );
}
