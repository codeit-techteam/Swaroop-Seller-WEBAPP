"use client";

import Link from "next/link";
import { useMemo } from "react";

import { OperationsShell, OpsStatusBadge, OpsTable } from "@/components/operations";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useClientTable } from "@/hooks/useClientTable";
import { ROUTES } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import { stageIndex } from "@/modules/procurement/selectors";
import { useWorkbench } from "@/modules/procurement/use-workbench";
import type { ProcurementItem } from "@/types/procurement";
import { PROCUREMENT_STAGES } from "@/types/procurement";

const STAGE_LABEL: Record<string, string> = {
  CREATED: "PR Created",
  UNDER_REVIEW: "PR Reviewed",
  SELLER_SOURCING: "Seller Assigned",
  QUOTATION: "Quotation Received",
  NEGOTIATION: "Negotiation",
  APPROVAL: "Procurement Approved",
  PO_CREATED: "PO Created",
  SELLER_CONFIRMED: "Seller Confirmed",
  DISPATCHED: "Dispatch",
  DELIVERED: "Delivery",
  COMPLETED: "Completed",
  REQUEST_CREATED: "PR Created",
  SUPPLIER_SEARCH: "Seller Assigned",
  OFFER_RECEIVED: "Quotation Received",
  READY_FOR_DISPATCH: "Dispatch",
};

export function ProcurementTrackingView() {
  const { items } = useWorkbench();
  const searchFields = useMemo(
    () => (row: ProcurementItem) => [
      row.requestId,
      row.commodity,
      row.grade,
      row.buyer,
      row.supplier,
      row.owner,
      row.stage,
    ],
    [],
  );
  const table = useClientTable({ rows: items, searchFields, pageSize: 10 });

  const kpis = useMemo(
    () => ({
      active: items.filter(
        (item) =>
          item.status !== "REJECTED" &&
          item.status !== "CANCELLED" &&
          item.status !== "COMPLETED",
      ).length,
      awaitingSupplier: items.filter((item) => item.stage === "SUPPLIER_SEARCH")
        .length,
      negotiation: items.filter((item) => item.status === "NEGOTIATION").length,
      awaitingApproval: items.filter((item) => item.status === "PENDING_APPROVAL")
        .length,
      poCreated: items.filter(
        (item) => item.status === "PO_CREATED" || item.type === "PO",
      ).length,
      delayed: items.filter((item) => item.delayed).length,
    }),
    [items],
  );

  return (
    <OperationsShell
      title="Procurement Tracking Center"
      subtitle="Track procurement lifecycle from request creation through dispatch readiness."
      kpis={[
        { title: "Active Requests", value: kpis.active },
        { title: "Awaiting Supplier", value: kpis.awaitingSupplier },
        { title: "In Negotiation", value: kpis.negotiation },
        { title: "Awaiting Approval", value: kpis.awaitingApproval },
        { title: "PO Created", value: kpis.poCreated },
        { title: "Delayed", value: kpis.delayed },
      ]}
    >
      <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex min-w-[720px] items-center justify-between gap-2">
          {PROCUREMENT_STAGES.map((stage, index) => (
            <div key={stage} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center text-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F1FF] text-xs font-bold text-[#1B6EF3]">
                  {index + 1}
                </span>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  {STAGE_LABEL[stage]}
                </p>
              </div>
              {index < PROCUREMENT_STAGES.length - 1 ? (
                <span className="mb-5 h-px flex-1 bg-slate-200" />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search PR / PO, commodity, owner"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={[
          "ALL",
          "NEW",
          "UNDER_REVIEW",
          "SELLER_SOURCING",
          "QUOTATION_RECEIVED",
          "NEGOTIATION",
          "APPROVAL_PENDING",
          "CONVERTED_TO_PO",
          "COMPLETED",
        ]}
        headers={[
          "PR/PO ID",
          "Commodity",
          "Buyer",
          "Supplier",
          "Current Stage",
          "Owner",
          "Created",
          "Expected Completion",
          "Priority",
          "Status",
          "Action",
        ]}
        emptyTitle="No procurement requests found"
        emptyDescription="No tracking records match the current search."
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.filtered.length}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        rowCount={table.paginated.length}
      >
        {table.paginated.map((item) => (
          <TableRow key={item.id} className="cursor-pointer">
            <TableCell>
              <Link
                href={`${ROUTES.PROCUREMENT_PURCHASE_REQUESTS}/${item.requestId}`}
                className="font-medium text-[#1B6EF3] hover:underline"
              >
                {item.requestId}
              </Link>
            </TableCell>
            <TableCell>
              {item.commodity} {item.grade}
            </TableCell>
            <TableCell>{item.buyer}</TableCell>
            <TableCell>{item.supplier}</TableCell>
            <TableCell>
              <span
                className={cn(
                  "text-xs font-semibold",
                  stageIndex(item.stage) >= 4 ? "text-emerald-700" : "text-slate-700",
                )}
              >
                {STAGE_LABEL[item.stage]}
              </span>
            </TableCell>
            <TableCell>{item.owner}</TableCell>
            <TableCell>{formatDate(item.createdAt)}</TableCell>
            <TableCell>{formatDate(item.expectedCompletion)}</TableCell>
            <TableCell>
              <OpsStatusBadge status={item.priority} />
            </TableCell>
            <TableCell>
              <OpsStatusBadge status={item.status} />
            </TableCell>
            <TableCell>
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs" asChild>
                <Link href={`${ROUTES.PROCUREMENT_PURCHASE_REQUESTS}/${item.requestId}`}>Open</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>
    </OperationsShell>
  );
}
