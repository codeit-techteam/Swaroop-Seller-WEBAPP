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
import { formatCompactInr, formatNumber } from "@/lib/utils";
import { useCustomerStore } from "@/store/customerStore";
import { useProcurementStore } from "@/store/procurementStore";
import type { ProcurementItem } from "@/types/procurement";

export function CustomerRequestsView() {
  const params = useSearchParams();
  const customerId = params.get("customer");
  const statusParam = params.get("status")?.toUpperCase() ?? "ALL";
  const customer = useCustomerStore((s) =>
    customerId ? s.getCustomer(customerId) : undefined,
  );
  const items = useProcurementStore((s) => s.items);
  const rows = useMemo(() => {
    if (!customer) return items;
    const needle = customer.companyName.split(" ")[0]?.toLowerCase() ?? "";
    return items.filter(
      (item) =>
        item.buyer === customer.name ||
        item.buyerCompany === customer.companyName ||
        item.buyerCompany.toLowerCase().includes(needle),
    );
  }, [customer, items]);
  const searchFields = useMemo(
    () => (row: ProcurementItem) => [
      row.requestId,
      row.buyer,
      row.commodity,
      row.grade,
      row.destination,
    ],
    [],
  );
  const table = useClientTable({
    rows,
    searchFields,
    getStatus: (row) => row.status,
    initialStatus: [
      "ALL",
      "NEW",
      "UNDER_REVIEW",
      "NEGOTIATION",
      "APPROVED",
      "REJECTED",
    ].includes(statusParam)
      ? statusParam
      : "ALL",
  });

  return (
    <OperationsShell
      title="Customer purchase requests"
      subtitle="Customer APP/WEB PRs land in the same Procurement Workbench queue. No duplicate request data."
      kpis={[
        {
          title: "Open PRs",
          value: rows.filter(
            (row) => row.status === "NEW" || row.status === "UNDER_REVIEW",
          ).length,
        },
        {
          title: "In negotiation",
          value: rows.filter((row) => row.status === "NEGOTIATION").length,
        },
      ]}
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search PR, customer or product"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={[
          "ALL",
          "NEW",
          "UNDER_REVIEW",
          "NEGOTIATION",
          "APPROVED",
          "REJECTED",
        ]}
        headers={[
          "PR ID",
          "Customer",
          "Product",
          "Qty",
          "Location",
          "Requested",
          "Status",
          "Workbench",
        ]}
        emptyTitle="No customer PRs"
        emptyDescription="No purchase requests match the current filter."
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.filtered.length}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        rowCount={table.paginated.length}
      >
        {table.paginated.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.requestId}</TableCell>
            <TableCell>
              <p>{row.buyer}</p>
              <p className="text-xs text-slate-400">{row.buyerCompany}</p>
            </TableCell>
            <TableCell>
              {row.commodity} {row.grade}
            </TableCell>
            <TableCell>
              {formatNumber(row.quantityMt)} {row.quantityUnit}
            </TableCell>
            <TableCell>{row.destination}</TableCell>
            <TableCell>{formatCompactInr(row.unitPrice)}/MT</TableCell>
            <TableCell>
              <OpsStatusBadge status={row.status} />
            </TableCell>
            <TableCell>
              <Link
                href={`${ROUTES.PROCUREMENT}/${row.requestId}`}
                className="text-sm font-medium text-[#1B6EF3] hover:underline"
              >
                Open workbench
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>
    </OperationsShell>
  );
}
