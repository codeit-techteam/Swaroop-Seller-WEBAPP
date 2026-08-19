"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { OperationsShell, OpsStatusBadge, OpsTable } from "@/components/operations";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useClientTable } from "@/hooks/useClientTable";
import { ROUTES } from "@/lib/constants";
import { formatCompactInr, formatDate, formatNumber } from "@/lib/utils";
import { DispatchDialog } from "@/modules/procurement/dispatch-dialog";
import { useWorkbench } from "@/modules/procurement/use-workbench";
import { useProcurementStore } from "@/store/procurementStore";
import type { ProcurementItem } from "@/types/procurement";

const PO_STATUSES = [
  "ALL",
  "PO_DRAFT",
  "SENT_TO_SELLER",
  "SELLER_REVIEW",
  "CONFIRMED",
  "REJECTED",
  "READY_FOR_DISPATCH",
  "DISPATCHED",
  "IN_TRANSIT",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

export function ProcurementOrdersView() {
  const { items, isSeller, isAdmin } = useWorkbench();
  const sendPurchaseOrder = useProcurementStore((s) => s.sendPurchaseOrder);
  const acceptPurchaseOrder = useProcurementStore((s) => s.acceptPurchaseOrder);
  const rejectPurchaseOrder = useProcurementStore((s) => s.rejectPurchaseOrder);
  const requestPoChange = useProcurementStore((s) => s.requestPoChange);
  const recordDispatch = useProcurementStore((s) => s.recordDispatch);
  const markInTransit = useProcurementStore((s) => s.markInTransit);
  const markDelivered = useProcurementStore((s) => s.markDelivered);
  const completeOrder = useProcurementStore((s) => s.completeOrder);
  const updateStatus = useProcurementStore((s) => s.updateStatus);
  const rows = useMemo(() => items.filter((item) => item.type === "PO"), [items]);
  const searchFields = useMemo(
    () => (row: ProcurementItem) => [
      row.id,
      row.poId ?? "",
      row.prId ?? "",
      row.buyer,
      row.supplier,
      row.commodity,
      row.grade,
    ],
    [],
  );
  const table = useClientTable({
    rows,
    searchFields,
    getStatus: (row) => row.poStatus ?? row.status,
  });
  const [dispatchItem, setDispatchItem] = useState<ProcurementItem | null>(null);
  const [acceptItem, setAcceptItem] = useState<ProcurementItem | null>(null);
  const [rejectItem, setRejectItem] = useState<ProcurementItem | null>(null);
  const [qty, setQty] = useState("");
  const [delivery, setDelivery] = useState("");
  const [reason, setReason] = useState("");

  return (
    <OperationsShell
      title="Procurement Orders"
      subtitle={
        isSeller
          ? "POs assigned to your company. Confirm, dispatch and complete fulfilment."
          : "Track procurement orders from issue through seller confirmation and delivery."
      }
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search PO, PR, customer, seller, material"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={PO_STATUSES}
        headers={[
          "PO ID",
          "PR ID",
          "Customer",
          "Seller",
          "Material",
          "Quantity",
          "Final Price",
          "PO Value",
          "Seller Confirmation",
          "Delivery Date",
          "Dispatch",
          "Status",
          "Action",
        ]}
        emptyTitle="No procurement orders"
        emptyDescription="Approve a PR to create a PO."
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
                href={`${ROUTES.PROCUREMENT_ORDERS}/${item.id}`}
                className="font-medium text-[#1B6EF3] hover:underline"
              >
                {item.poId ?? item.id}
              </Link>
            </TableCell>
            <TableCell>{item.prId ?? "—"}</TableCell>
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
            <TableCell>
              <OpsStatusBadge status={item.sellerConfirmation?.status ?? "PENDING"} />
            </TableCell>
            <TableCell>{formatDate(item.requestedDeliveryDate)}</TableCell>
            <TableCell>
              <OpsStatusBadge status={item.dispatch ? "DISPATCHED" : "PENDING"} />
            </TableCell>
            <TableCell>
              <OpsStatusBadge status={item.poStatus ?? item.status} />
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" asChild>
                  <Link href={`${ROUTES.PROCUREMENT_ORDERS}/${item.id}`}>View PO</Link>
                </Button>
                {isAdmin ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        sendPurchaseOrder(item.id);
                        toast.success(`${item.id} sent to seller.`);
                      }}
                    >
                      Send PO
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-red-600"
                      onClick={() => {
                        updateStatus(item.id, "CANCELLED");
                        toast.success("PO cancelled.");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs" asChild>
                      <Link href={`${ROUTES.PROCUREMENT_TRACKING}?id=${item.id}`}>
                        Track
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      className="h-7 bg-[#1B6EF3] px-2 text-xs hover:bg-[#1558C8]"
                      onClick={() => {
                        setAcceptItem(item);
                        setQty(String(item.quantityMt));
                        setDelivery(item.requestedDeliveryDate);
                      }}
                    >
                      Accept PO
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-red-600"
                      onClick={() => setRejectItem(item)}
                    >
                      Reject PO
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => setDispatchItem(item)}
                    >
                      Dispatch
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        markInTransit(item.id);
                        toast.success("Shipment marked in transit.");
                      }}
                    >
                      In transit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        markDelivered(item.id);
                        completeOrder(item.id);
                        toast.success("Delivery completed.");
                      }}
                    >
                      Complete
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>

      <DispatchDialog
        item={dispatchItem}
        open={Boolean(dispatchItem)}
        onClose={() => setDispatchItem(null)}
        onConfirm={(input) => {
          if (!dispatchItem) return;
          recordDispatch(dispatchItem.id, input);
          toast.success("Dispatch recorded.");
        }}
      />

      <Dialog open={Boolean(acceptItem)} onOpenChange={(next) => !next && setAcceptItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept procurement order</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Confirm quantity (MT)</Label>
              <Input className="mt-1.5" value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
            <div>
              <Label>Confirm delivery date</Label>
              <Input
                className="mt-1.5"
                type="date"
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptItem(null)}>
              Cancel
            </Button>
            <Button
              className="bg-[#1B6EF3] hover:bg-[#1558C8]"
              onClick={() => {
                if (!acceptItem) return;
                acceptPurchaseOrder(acceptItem.id, Number(qty) || acceptItem.quantityMt, delivery);
                toast.success(`${acceptItem.id} confirmed.`);
                setAcceptItem(null);
              }}
            >
              Confirm quantity & date
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(rejectItem)} onOpenChange={(next) => !next && setRejectItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject or request change</DialogTitle>
          </DialogHeader>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectItem(null)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (!rejectItem) return;
                requestPoChange(rejectItem.id, reason || "Change requested");
                toast.success("Change requested.");
                setRejectItem(null);
                setReason("");
              }}
            >
              Request change
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!rejectItem) return;
                rejectPurchaseOrder(rejectItem.id, reason || "Rejected");
                toast.success("PO rejected.");
                setRejectItem(null);
                setReason("");
              }}
            >
              Reject PO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OperationsShell>
  );
}
