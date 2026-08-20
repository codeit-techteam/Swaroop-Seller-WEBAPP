"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import {
  OperationsShell,
  OpsStatusBadge,
  OpsTable,
} from "@/components/operations";
import { TableCell, TableRow } from "@/components/ui/table";
import { useClientTable } from "@/hooks/useClientTable";
import { ROUTES } from "@/lib/constants";
import { formatCompactInr } from "@/lib/utils";
import { useCustomerStore } from "@/store/customerStore";
import { useOrdersStore } from "@/store/ordersStore";
import type { Order } from "@/types/orders";

const CUSTOMER_STATUS: Record<string, string> = {
  new: "PR Submitted",
  accepted: "Confirmed",
  processing: "Processing",
  dispatch_ready: "Ready for Dispatch",
  in_transit: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
  delayed: "In Transit",
};

export function CustomerOrdersView() {
  const params = useSearchParams();
  const customerId = params.get("customer");
  const customer = useCustomerStore((s) =>
    customerId ? s.getCustomer(customerId) : undefined,
  );
  const orders = useOrdersStore((s) => s.orders);
  const rows = useMemo(() => {
    if (!customer) return orders;
    const needle = customer.companyName.split(" ")[0]?.toLowerCase() ?? "";
    return orders.filter((order) =>
      order.buyerCompany.toLowerCase().includes(needle),
    );
  }, [customer, orders]);
  const searchFields = useMemo(
    () => (row: Order) => [
      row.orderNumber,
      row.buyerCompany,
      row.productName,
      row.productGrade,
    ],
    [],
  );
  const table = useClientTable({
    rows,
    searchFields,
    getStatus: (row) => row.status.toUpperCase(),
  });

  return (
    <OperationsShell
      title="Customer orders"
      subtitle="Same order records as Commerce → Orders. Customer APP sees friendly statuses; this desk sees operations status."
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search order, buyer or grade"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={[
          "ALL",
          "NEW",
          "ACCEPTED",
          "PROCESSING",
          "DISPATCH_READY",
          "IN_TRANSIT",
          "DELIVERED",
          "CANCELLED",
        ]}
        headers={[
          "Order",
          "Customer",
          "Product",
          "Qty",
          "Value",
          "Customer status",
          "Ops status",
        ]}
        emptyTitle="No customer orders"
        emptyDescription="No orders match the selected customer or filters."
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
                href={`${ROUTES.ORDERS}/${row.id}`}
                className="font-medium text-[#1B6EF3] hover:underline"
              >
                {row.orderNumber}
              </Link>
            </TableCell>
            <TableCell>{row.buyerCompany}</TableCell>
            <TableCell>
              {row.productName}
              <p className="text-xs text-slate-400">{row.productGrade}</p>
            </TableCell>
            <TableCell>{row.quantityMt} MT</TableCell>
            <TableCell>
              {formatCompactInr(row.financials.totalLandedCost)}
            </TableCell>
            <TableCell>{CUSTOMER_STATUS[row.status] ?? row.status}</TableCell>
            <TableCell>
              <OpsStatusBadge
                status={row.status.replaceAll("-", "_").toUpperCase()}
              />
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>
    </OperationsShell>
  );
}
