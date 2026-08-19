"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { EmptyState } from "@/components/common";
import { OperationsShell, OpsStatusBadge, OpsTable } from "@/components/operations";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useClientTable } from "@/hooks/useClientTable";
import { ROUTES } from "@/lib/constants";
import { formatCompactInr, formatNumber } from "@/lib/utils";
import { ApproveDialog } from "@/modules/procurement/approve-dialog";
import { RejectDialog } from "@/modules/procurement/reject-dialog";
import { useWorkbench } from "@/modules/procurement/use-workbench";
import { useProcurementStore } from "@/store/procurementStore";
import type { ProcurementItem, RejectionReason } from "@/types/procurement";

export function ProcurementApprovalView() {
  const router = useRouter();
  const { items, isSeller } = useWorkbench();
  const approveProcurement = useProcurementStore((s) => s.approveProcurement);
  const rejectRequest = useProcurementStore((s) => s.rejectRequest);
  const sendBackApproval = useProcurementStore((s) => s.sendBackApproval);
  const rows = useMemo(
    () =>
      items.filter(
        (item) =>
          item.type === "PR" &&
          (item.status === "APPROVAL_PENDING" ||
            item.status === "PENDING_APPROVAL" ||
            item.negotiationStatus === "COMPLETED"),
      ),
    [items],
  );
  const searchFields = useMemo(
    () => (row: ProcurementItem) => [
      row.requestId,
      row.buyer,
      row.supplier,
      row.commodity,
      row.grade,
    ],
    [],
  );
  const table = useClientTable({ rows, searchFields });
  const [approveItem, setApproveItem] = useState<ProcurementItem | null>(null);
  const [rejectItem, setRejectItem] = useState<ProcurementItem | null>(null);

  if (isSeller) {
    return (
      <OperationsShell title="Procurement Approval" subtitle="Admin only">
        <EmptyState
          title="Not available"
          description="Procurement approval, margin and internal comments are hidden from sellers."
        />
      </OperationsShell>
    );
  }

  return (
    <OperationsShell
      title="Procurement Approval"
      subtitle="Approve finalized commercials and create the procurement order."
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search PR, customer, seller, material"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={["ALL", "APPROVAL_PENDING", "APPROVED", "REJECTED"]}
        headers={[
          "PR ID",
          "Customer",
          "Seller",
          "Material",
          "Quantity",
          "Final Price",
          "Total Value",
          "Margin",
          "Delivery",
          "Payment Terms",
          "Negotiation Status",
          "Approval Status",
          "Action",
        ]}
        emptyTitle="Nothing pending approval"
        emptyDescription="Finalize a negotiation to send a PR here."
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
            <TableCell>{item.buyer}</TableCell>
            <TableCell>{item.supplier}</TableCell>
            <TableCell>
              {item.commodity} {item.grade}
            </TableCell>
            <TableCell>
              {formatNumber(item.quantityMt)} {item.quantityUnit}
            </TableCell>
            <TableCell>₹{formatNumber(item.unitPrice)}</TableCell>
            <TableCell>{formatCompactInr(item.negotiatedValue)}</TableCell>
            <TableCell>{formatCompactInr(item.margin ?? item.commission)}</TableCell>
            <TableCell>{item.requestedDeliveryDate}</TableCell>
            <TableCell>{item.paymentTerms}</TableCell>
            <TableCell>
              <OpsStatusBadge status={item.negotiationStatus ?? "NONE"} />
            </TableCell>
            <TableCell>
              <OpsStatusBadge status={item.status} />
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                <Button
                  size="sm"
                  className="h-7 bg-[#1B6EF3] px-2 text-xs hover:bg-[#1558C8]"
                  onClick={() => setApproveItem(item)}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs text-red-600"
                  onClick={() => setRejectItem(item)}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs"
                  onClick={() => {
                    sendBackApproval(item.requestId, "Sent back from approval desk");
                    toast.success("Sent back for revision.");
                  }}
                >
                  Send Back
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>
      <ApproveDialog
        item={approveItem}
        open={Boolean(approveItem)}
        onClose={() => setApproveItem(null)}
        onConfirm={() => {
          if (!approveItem) return;
          const poId = approveProcurement(approveItem.requestId);
          toast.success(`Procurement approved. ${poId} created.`);
          setApproveItem(null);
          router.push(`${ROUTES.PROCUREMENT_ORDERS}/${poId}`);
        }}
      />
      <RejectDialog
        item={rejectItem}
        open={Boolean(rejectItem)}
        onClose={() => setRejectItem(null)}
        onConfirm={(reason: RejectionReason, remarks: string) => {
          if (!rejectItem) return;
          rejectRequest(rejectItem.requestId, reason, remarks);
          toast.success("Procurement rejected.");
        }}
      />
    </OperationsShell>
  );
}
