"use client";

import { BarChart3, Plus, Truck, UserPlus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ActionCard } from "@/components/erp";
import {
  OperationsShell,
  OpsStatusBadge,
  OpsTable,
} from "@/components/operations";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useClientTable } from "@/hooks/useClientTable";
import { ROUTES } from "@/lib/constants";
import { formatCompactInr, formatNumber } from "@/lib/utils";
import { AddSellerDrawer } from "@/modules/procurement/add-seller-drawer";
import { ApproveDialog } from "@/modules/procurement/approve-dialog";
import { CreatePrDrawer } from "@/modules/procurement/create-pr-drawer";
import { RejectDialog } from "@/modules/procurement/reject-dialog";
import { computeProcurementSummary } from "@/modules/procurement/selectors";
import { useWorkbench } from "@/modules/procurement/use-workbench";
import { useProcurementStore } from "@/store/procurementStore";
import type { ProcurementItem, RejectionReason } from "@/types/procurement";

const STATUSES = [
  "ALL",
  "NEW",
  "UNDER_REVIEW",
  "SELLER_SOURCING",
  "QUOTATION_RECEIVED",
  "NEGOTIATION",
  "APPROVAL_PENDING",
  "APPROVED",
  "REJECTED",
  "CONVERTED_TO_PO",
  "COMPLETED",
];

export function ProcurementWorkbenchView() {
  const { items, isSeller } = useWorkbench();
  const approveProcurement = useProcurementStore((s) => s.approveProcurement);
  const rejectRequest = useProcurementStore((s) => s.rejectRequest);
  const searchFields = useMemo(
    () => (row: ProcurementItem) => [
      row.requestId,
      row.id,
      row.commodity,
      row.grade,
      `${row.commodity} ${row.grade}`,
      row.buyer,
      row.supplier,
    ],
    [],
  );
  const table = useClientTable({ rows: items, searchFields });
  const summary = useMemo(() => computeProcurementSummary(items), [items]);
  const [createOpen, setCreateOpen] = useState(false);
  const [sellerOpen, setSellerOpen] = useState(false);
  const [approveItem, setApproveItem] = useState<ProcurementItem | null>(null);
  const [rejectItem, setRejectItem] = useState<ProcurementItem | null>(null);

  const commodityLabel = (item: ProcurementItem) =>
    `${item.commodity} ${item.grade}`.trim();

  return (
    <OperationsShell
      title="Procurement Workbench"
      subtitle={
        isSeller
          ? "Assigned RFQs, negotiations, POs and dispatch for your company."
          : "PetroTrade procurement control room — customer PRs through seller fulfilment."
      }
      kpis={[
        { title: "Pending Approvals", value: summary.pendingApprovals },
        {
          title: "Avg Processing Time",
          value: summary.averageProcessingHours,
          suffix: "hrs",
        },
        { title: "Active Negotiations", value: summary.activeNegotiations },
        {
          title: "Open PO Value",
          value: summary.openPoValue / 1_00_00_000,
          prefix: "₹",
          suffix: "Cr",
          decimals: 1,
        },
        { title: "Pending PRs", value: summary.pendingPrs },
        { title: "Completed", value: summary.completed },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px] xl:grid-cols-[minmax(0,1fr)_260px]">
        <OpsTable
          search={table.search}
          onSearch={table.setSearch}
          searchPlaceholder="Search PO / PR, buyer or supplier"
          status={table.status}
          onStatusChange={table.setStatus}
          statusOptions={STATUSES}
          headers={[
            "PO / PR ID",
            "Commodity",
            "Buyer",
            "Supplier",
            "Est. Cost",
            "Qty",
            "Status",
            "Action",
          ]}
          emptyTitle="No procurement requests found"
          emptyDescription="There are no procurement items matching the current filters."
          page={table.page}
          totalPages={table.totalPages}
          totalItems={table.filtered.length}
          pageSize={table.pageSize}
          onPageChange={table.setPage}
          rowCount={table.paginated.length}
        >
          {table.paginated.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Link
                  href={`${ROUTES.PROCUREMENT_PURCHASE_REQUESTS}/${item.requestId}`}
                  className="font-medium text-[#1B6EF3] hover:underline"
                >
                  {item.requestId}
                </Link>
              </TableCell>
              <TableCell className="font-medium text-slate-800">
                {commodityLabel(item)}
              </TableCell>
              <TableCell>{item.buyer}</TableCell>
              <TableCell>{item.supplier}</TableCell>
              <TableCell className="tabular-nums">
                {formatCompactInr(item.estimatedCost)}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatNumber(item.quantityMt)} {item.quantityUnit}
              </TableCell>
              <TableCell>
                {item.status === "NEGOTIATION" ? (
                  <Link href={`${ROUTES.PROCUREMENT_NEGOTIATION}/${item.requestId}`}>
                    <OpsStatusBadge status={item.status} />
                  </Link>
                ) : (
                  <OpsStatusBadge status={item.status} />
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    disabled={
                      item.status === "APPROVED" ||
                      item.status === "REJECTED" ||
                      item.status === "CANCELLED" ||
                      item.status === "COMPLETED"
                    }
                    onClick={() => setApproveItem(item)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-red-600"
                    disabled={
                      item.status === "REJECTED" || item.status === "CANCELLED"
                    }
                    onClick={() => setRejectItem(item)}
                  >
                    Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </OpsTable>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <ActionCard
              label="New PR"
              icon={Plus}
              variant="light"
              onClick={() => setCreateOpen(true)}
            />
            <ActionCard
              label="Add Seller"
              icon={UserPlus}
              variant="light"
              onClick={() => setSellerOpen(true)}
            />
            <ActionCard
              label="Reports"
              icon={BarChart3}
              href={ROUTES.PROCUREMENT_REPORTS}
              variant="light"
            />
            <ActionCard
              label="Tracking"
              icon={Truck}
              href={ROUTES.PROCUREMENT_TRACKING}
              variant="light"
            />
          </div>
          <p className="text-xs leading-5 text-slate-500">
            This workbench is the Admin ↔ Seller operating system. Customers never
            negotiate directly with sellers.
          </p>
        </div>
      </div>

      <CreatePrDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(requestId) => {
          toast.success(`Purchase Request ${requestId} created successfully.`);
        }}
      />
      <AddSellerDrawer
        open={sellerOpen}
        onClose={() => setSellerOpen(false)}
        onAdded={() => toast.success("Seller added successfully.")}
      />
      <ApproveDialog
        item={approveItem}
        open={Boolean(approveItem)}
        onClose={() => setApproveItem(null)}
        onConfirm={() => {
          if (!approveItem) return;
          approveProcurement(approveItem.requestId);
          toast.success(`${approveItem.requestId} approved. PO created.`);
          setApproveItem(null);
        }}
      />
      <RejectDialog
        item={rejectItem}
        open={Boolean(rejectItem)}
        onClose={() => setRejectItem(null)}
        onConfirm={(reason: RejectionReason, remarks: string) => {
          if (!rejectItem) return;
          rejectRequest(rejectItem.requestId, reason, remarks);
          toast.success("Purchase Request rejected.");
        }}
      />
    </OperationsShell>
  );
}
