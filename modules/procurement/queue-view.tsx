"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { OperationsShell, OpsStatusBadge, OpsTable } from "@/components/operations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { useClientTable } from "@/hooks/useClientTable";
import { ROUTES } from "@/lib/constants";
import { formatCompactInr, formatDate, formatNumber } from "@/lib/utils";
import { ApproveDialog } from "@/modules/procurement/approve-dialog";
import { AssignSellerDialog } from "@/modules/procurement/assign-seller-dialog";
import { ProcurementQueueActions } from "@/modules/procurement/procurement-queue-actions";
import { QuoteDrawer } from "@/modules/procurement/quote-drawer";
import { RejectDialog } from "@/modules/procurement/reject-dialog";
import { computeProcurementSummary } from "@/modules/procurement/selectors";
import { useWorkbench } from "@/modules/procurement/use-workbench";
import { useProcurementStore } from "@/store/procurementStore";
import { type ProcurementItem, QUEUE_STATUSES, type RejectionReason } from "@/types/procurement";

const STATUSES = ["ALL", ...QUEUE_STATUSES];

export function ProcurementQueueView() {
  const router = useRouter();
  const { items, isSeller, isAdmin, sellerId } = useWorkbench();
  const reviewRequest = useProcurementStore((s) => s.reviewRequest);
  const assignSellers = useProcurementStore((s) => s.assignSellers);
  const rejectRequest = useProcurementStore((s) => s.rejectRequest);
  const approveProcurement = useProcurementStore((s) => s.approveProcurement);
  const startNegotiation = useProcurementStore((s) => s.startNegotiation);
  const submitQuote = useProcurementStore((s) => s.submitQuote);
  const rows = useMemo(
    () => items.filter((item) => item.type === "PR"),
    [items],
  );
  const summary = useMemo(() => computeProcurementSummary(items), [items]);
  const [priority, setPriority] = useState("ALL");
  const searchFields = useMemo(
    () => (row: ProcurementItem) => [
      row.requestId,
      row.prId ?? "",
      row.buyer,
      row.supplier,
      row.commodity,
      row.grade,
      `${row.commodity} ${row.grade}`,
    ],
    [],
  );
  const filteredRows = useMemo(
    () =>
      rows.filter((row) => priority === "ALL" || row.priority === priority),
    [priority, rows],
  );
  const table = useClientTable({ rows: filteredRows, searchFields, pageSize: 8 });
  const [assignItem, setAssignItem] = useState<ProcurementItem | null>(null);
  const [approveItem, setApproveItem] = useState<ProcurementItem | null>(null);
  const [rejectItem, setRejectItem] = useState<ProcurementItem | null>(null);
  const [quoteItem, setQuoteItem] = useState<ProcurementItem | null>(null);

  const kpis = isSeller
    ? [
        {
          title: "New RFQs",
          value: rows.filter((item) => item.status === "SELLER_SOURCING").length,
        },
        {
          title: "Quotes Pending",
          value: rows.filter(
            (item) =>
              item.status === "SELLER_SOURCING" &&
              !item.offers.some((offer) => offer.supplierId === sellerId && offer.status === "SUBMITTED"),
          ).length,
        },
        {
          title: "Negotiations",
          value: rows.filter((item) => item.status === "NEGOTIATION").length,
        },
        {
          title: "POs Awaiting Confirmation",
          value: items.filter(
            (item) =>
              item.type === "PO" &&
              (item.poStatus === "SENT_TO_SELLER" || item.poStatus === "SELLER_REVIEW"),
          ).length,
        },
        {
          title: "Dispatch Pending",
          value: items.filter((item) => item.poStatus === "CONFIRMED").length,
        },
      ]
    : [
        { title: "New Requests", value: summary.newRequests },
        { title: "Under Review", value: summary.underReview },
        { title: "Awaiting Seller Quote", value: summary.awaitingQuote },
        { title: "Negotiation", value: summary.activeNegotiations },
        { title: "Approval Pending", value: summary.pendingApprovals },
        { title: "Overdue", value: summary.overdue },
      ];

  return (
    <OperationsShell
      title={isSeller ? "Seller Procurement Queue" : "Procurement Queue"}
      subtitle={
        isSeller
          ? "RFQs, quotations and negotiations assigned to your company."
          : "Review and process incoming purchase requests"
      }
      kpis={kpis}
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search PR, customer, seller, material, grade"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={STATUSES}
        extraFilters={
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="h-9 w-[150px] border-slate-200 bg-white text-sm">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All priorities</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        }
        headers={
          isSeller
            ? [
                "RFQ ID",
                "Customer / Buyer",
                "Material",
                "Quantity",
                "Required Date",
                "Quote Status",
                "Negotiation",
                "Action",
              ]
            : [
                "PR ID",
                "Customer",
                "Material / Commodity",
                "Grade",
                "Quantity",
                "Required Delivery",
                "Estimated Value",
                "Current Seller Status",
                "Priority",
                "Created Date",
                "Status",
                "Action",
              ]
        }
        emptyTitle="No purchase requests"
        emptyDescription="Nothing in this queue for the current filters."
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.filtered.length}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        rowCount={table.paginated.length}
      >
        {table.paginated.map((item) => {
          const ownQuote = item.offers.find((offer) => offer.supplierId === sellerId);
          return (
            <TableRow key={item.id} className="hover:bg-slate-50/50">
              <TableCell className="px-4 py-4">
                <Link
                  href={`${ROUTES.PROCUREMENT_PURCHASE_REQUESTS}/${item.requestId}`}
                  className="font-semibold text-[#1B6EF3] hover:underline"
                >
                  {item.requestId}
                </Link>
              </TableCell>
              <TableCell className="px-4 py-4 text-slate-700">{item.buyer}</TableCell>
              {isSeller ? (
                <>
                  <TableCell className="px-4 py-4 font-medium text-slate-800">
                    {item.commodity} {item.grade}
                  </TableCell>
                  <TableCell className="px-4 py-4 tabular-nums text-slate-700">
                    {formatNumber(item.quantityMt)} {item.quantityUnit}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-slate-600">
                    {formatDate(item.requestedDeliveryDate)}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <OpsStatusBadge
                      minimal
                      status={ownQuote?.status ?? "QUOTE PENDING"}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <OpsStatusBadge
                      minimal
                      status={item.negotiationStatus ?? "NONE"}
                    />
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className="px-4 py-4 font-medium text-slate-800">
                    {item.commodity}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-slate-600">{item.grade}</TableCell>
                  <TableCell className="px-4 py-4 tabular-nums text-slate-700">
                    {formatNumber(item.quantityMt)} {item.quantityUnit}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-slate-600">
                    {formatDate(item.requestedDeliveryDate)}
                  </TableCell>
                  <TableCell className="px-4 py-4 tabular-nums text-slate-800">
                    {formatCompactInr(item.estimatedCost)}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <OpsStatusBadge minimal status={item.sellerStatus ?? "UNASSIGNED"} />
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <OpsStatusBadge minimal status={item.priority} />
                  </TableCell>
                  <TableCell className="px-4 py-4 text-slate-600">
                    {formatDate(item.createdAt)}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <OpsStatusBadge minimal status={item.status} />
                  </TableCell>
                </>
              )}
              <TableCell className="px-4 py-4">
                <ProcurementQueueActions
                  item={item}
                  isAdmin={isAdmin}
                  onReview={() => {
                    reviewRequest(item.requestId);
                    toast.success(`${item.requestId} moved to under review.`);
                  }}
                  onAssignSeller={() => setAssignItem(item)}
                  onCompare={() =>
                    router.push(
                      `${ROUTES.PROCUREMENT_SELLER_COMPARISON}?pr=${item.requestId}`,
                    )
                  }
                  onNegotiate={() => {
                    startNegotiation(item.requestId);
                    router.push(
                      `${ROUTES.PROCUREMENT_NEGOTIATION}/${item.requestId}`,
                    );
                  }}
                  onApprove={() => setApproveItem(item)}
                  onReject={() => setRejectItem(item)}
                  onSubmitQuote={() => setQuoteItem(item)}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </OpsTable>

      <AssignSellerDialog
        item={assignItem}
        open={Boolean(assignItem)}
        onClose={() => setAssignItem(null)}
        onConfirm={(sellers) => {
          if (!assignItem) return;
          assignSellers(assignItem.requestId, sellers);
          toast.success(`RFQ sent to ${sellers.length} sellers.`);
          setAssignItem(null);
        }}
      />
      <ApproveDialog
        item={approveItem}
        open={Boolean(approveItem)}
        onClose={() => setApproveItem(null)}
        onConfirm={() => {
          if (!approveItem) return;
          const poId = approveProcurement(approveItem.requestId);
          toast.success(`${approveItem.requestId} approved. ${poId} created.`);
          setApproveItem(null);
          router.push(ROUTES.PROCUREMENT_ORDERS);
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
      <QuoteDrawer
        item={quoteItem}
        open={Boolean(quoteItem)}
        onClose={() => setQuoteItem(null)}
        onSubmit={(input) => {
          if (!quoteItem) return;
          submitQuote(quoteItem.requestId, input);
          toast.success(
            input.asDraft ? "Quote draft saved." : "Quote submitted.",
          );
        }}
      />
    </OperationsShell>
  );
}
