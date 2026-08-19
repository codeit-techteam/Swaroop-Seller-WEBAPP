"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { EmptyState } from "@/components/common";
import { ActionDrawer, Timeline } from "@/components/erp";
import { OperationsShell, OpsStatusBadge } from "@/components/operations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/lib/constants";
import {
  formatCompactInr,
  formatDate,
  formatDateTime,
  formatNumber,
} from "@/lib/utils";
import { ApproveDialog } from "@/modules/procurement/approve-dialog";
import { AssignSellerDialog } from "@/modules/procurement/assign-seller-dialog";
import { QuoteDrawer } from "@/modules/procurement/quote-drawer";
import { RejectDialog } from "@/modules/procurement/reject-dialog";
import {
  findProcurementItem,
  potentialSavings,
  sellerVisibleOffers,
} from "@/modules/procurement/selectors";
import { useWorkbench } from "@/modules/procurement/use-workbench";
import { useProcurementStore } from "@/store/procurementStore";
import { useUsersStore } from "@/store/usersStore";
import type { ProcurementItem, RejectionReason } from "@/types/procurement";

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function Card({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className ?? ""}`}>
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ProcurementDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { isSeller, isAdmin, sellerId, allItems } = useWorkbench();
  const item = useMemo(() => findProcurementItem(allItems, id), [id, allItems]);
  const suppliers = useUsersStore((s) => s.suppliers);
  const approveProcurement = useProcurementStore((s) => s.approveProcurement);
  const rejectRequest = useProcurementStore((s) => s.rejectRequest);
  const startNegotiation = useProcurementStore((s) => s.startNegotiation);
  const addNote = useProcurementStore((s) => s.addNote);
  const acceptOffer = useProcurementStore((s) => s.acceptOffer);
  const rejectOffer = useProcurementStore((s) => s.rejectOffer);
  const updateItem = useProcurementStore((s) => s.updateItem);
  const assignSellers = useProcurementStore((s) => s.assignSellers);
  const submitQuote = useProcurementStore((s) => s.submitQuote);
  const addDocument = useProcurementStore((s) => s.addDocument);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [note, setNote] = useState("");

  if (!item) {
    return (
      <OperationsShell
        title="Procurement item"
        subtitle="The requested record is not in the mock queue."
      >
        <EmptyState
          title="Record not found"
          description="Return to the procurement workbench and select another item."
          action={
            <Button asChild>
              <Link href={ROUTES.PROCUREMENT}>Back to workbench</Link>
            </Button>
          }
        />
      </OperationsShell>
    );
  }

  const supplier = suppliers.find((row) => row.id === item.supplierId);
  const savings = potentialSavings(item);
  const locked =
    item.status === "REJECTED" ||
    item.status === "CANCELLED" ||
    item.status === "COMPLETED";

  const onApprove = (record: ProcurementItem) => {
    const poId = approveProcurement(record.requestId);
    toast.success(`${record.requestId} approved. ${poId} created.`);
    setApproveOpen(false);
    router.push(`${ROUTES.PROCUREMENT_ORDERS}/${poId}`);
  };

  return (
    <OperationsShell
      title={item.requestId}
      subtitle={`${item.commodity} ${item.grade}`}
      actions={
        <>
          <OpsStatusBadge status={item.status} />
          <Button variant="outline" asChild>
            <Link href={ROUTES.PROCUREMENT_QUEUE}>Back to queue</Link>
          </Button>
          <Button variant="outline" disabled={locked} onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          {isAdmin ? (
            <>
              <Button variant="outline" disabled={locked} onClick={() => setAssignOpen(true)}>
                Assign Seller
              </Button>
              <Button
                variant="outline"
                disabled={locked}
                onClick={() => {
                  startNegotiation(item.requestId);
                  router.push(`${ROUTES.PROCUREMENT_NEGOTIATION}/${item.requestId}`);
                }}
              >
                Start Negotiation
              </Button>
              <Button
                variant="ghost"
                className="text-red-600"
                disabled={locked}
                onClick={() => setRejectOpen(true)}
              >
                Reject
              </Button>
              <Button
                className="bg-[#1B6EF3] hover:bg-[#1558C8]"
                disabled={locked}
                onClick={() => setApproveOpen(true)}
              >
                Approve & Create PO
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setQuoteOpen(true)}>
                Submit Quote
              </Button>
              <Button variant="outline" asChild>
                <Link href={`${ROUTES.PROCUREMENT_NEGOTIATION}/${item.requestId}`}>
                  Negotiate
                </Link>
              </Button>
            </>
          )}
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Request Summary" className="lg:col-span-2">
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Commodity" value={item.commodity} />
            <Info label="Grade" value={item.grade} />
            <Info
              label="Quantity"
              value={`${formatNumber(item.quantityMt)} ${item.quantityUnit}`}
            />
            <Info
              label="Estimated Cost"
              value={formatCompactInr(item.estimatedCost)}
            />
            <Info label="Priority" value={item.priority} />
            <Info
              label="Required Date"
              value={formatDate(item.requestedDeliveryDate)}
            />
            <Info label="Warehouse" value={item.warehouse} />
            <Info label="Destination" value={item.destination} />
          </dl>
        </Card>
        <Card title="Commercial Summary">
          <dl className="grid gap-3">
            <Info
              label="Estimated Value"
              value={formatCompactInr(item.estimatedCost)}
            />
            <Info
              label="Supplier Offer"
              value={formatCompactInr(
                item.offers[0]
                  ? item.offers[0].unitPrice * item.offers[0].quantity
                  : item.estimatedCost,
              )}
            />
            <Info
              label="Negotiated Value"
              value={formatCompactInr(item.negotiatedValue)}
            />
            <Info label="Potential Savings" value={formatCompactInr(savings)} />
            {isAdmin ? (
              <Info label="Internal margin" value={formatCompactInr(item.margin ?? item.commission)} />
            ) : null}
            <Info
              label="Final PO Value"
              value={formatCompactInr(item.negotiatedValue || item.estimatedCost)}
            />
          </dl>
        </Card>
        <Card title="Buyer Information">
          <dl className="grid gap-3">
            <Info label="Company" value={item.buyerCompany} />
            <Info label="Contact" value={item.buyerContact} />
            <Info label="Location" value={item.destination} />
            <Info label="Payment Terms" value={item.paymentTerms} />
            <Info
              label="Credit Required"
              value={item.creditRequired ? "Yes" : "No"}
            />
          </dl>
        </Card>
        <Card title="Supplier Information">
          <dl className="grid gap-3">
            <Info label="Supplier" value={item.supplier} />
            <Info
              label="Contact"
              value={item.supplierContact || supplier?.contactPerson || "—"}
            />
            <Info
              label="Offer Price"
              value={
                item.offers[0]
                  ? `₹${formatNumber(item.offers[0].unitPrice)} / ${item.quantityUnit}`
                  : formatCompactInr(item.unitPrice)
              }
            />
            <Info
              label="MOQ"
              value={
                item.offers[0]
                  ? `${item.offers[0].moq} ${item.quantityUnit}`
                  : supplier?.moq ?? "—"
              }
            />
            <Info
              label="Payment Terms"
              value={item.offers[0]?.paymentTerms ?? item.paymentTerms}
            />
            <Info label="KYC Status" value={supplier?.kyc ?? "PENDING"} />
          </dl>
        </Card>
        <Card title={isAdmin ? "Offer Comparison" : "Your quotation"} className="lg:col-span-3">
          {sellerVisibleOffers(item, isSeller ? sellerId : undefined).length === 0 ? (
            <p className="text-sm text-slate-500">No supplier offers yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Payment Terms</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellerVisibleOffers(item, isSeller ? sellerId : undefined).map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">
                        {offer.supplierName}
                      </TableCell>
                      <TableCell>
                        ₹{formatNumber(offer.unitPrice)} / {item.quantityUnit}
                      </TableCell>
                      <TableCell>
                        {formatNumber(offer.quantity)} {item.quantityUnit}
                      </TableCell>
                      <TableCell>{offer.delivery}</TableCell>
                      <TableCell>{offer.paymentTerms}</TableCell>
                      <TableCell>
                        <OpsStatusBadge status={offer.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {isAdmin ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            disabled={offer.status === "ACCEPTED"}
                            onClick={() => {
                              acceptOffer(item.requestId, offer.id);
                              toast.success("Offer accepted.");
                            }}
                          >
                            Accept
                          </Button>
                          ) : null}
                          {isAdmin ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-red-600"
                            disabled={offer.status === "REJECTED"}
                            onClick={() => {
                              rejectOffer(item.requestId, offer.id);
                              toast.success("Offer rejected.");
                            }}
                          >
                            Reject
                          </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
        <Card title="Procurement Timeline">
          <Timeline
            items={item.timeline.map((event) => ({
              id: event.id,
              title: event.title,
              description: event.description,
              time: event.at ? formatDateTime(event.at) : "Pending",
              status: event.done ? "success" : "pending",
            }))}
          />
        </Card>
        <Card title="Documents">
          <ul className="space-y-2 text-sm">
            {(item.documents ?? [])
              .filter((doc) => isAdmin || doc.visibleToSeller)
              .map((doc) => (
                <li key={doc.id} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2">
                  <span>{doc.name}</span>
                  <OpsStatusBadge status={doc.kind} />
                </li>
              ))}
          </ul>
          <Button
            className="mt-3"
            size="sm"
            variant="outline"
            onClick={() => {
              addDocument(item.requestId, `Upload ${Date.now()}.pdf`, isSeller ? "QUOTATION" : "COMMERCIAL");
              toast.success("Document recorded.");
            }}
          >
            Upload document
          </Button>
        </Card>
        {isAdmin ? (
        <Card title="Internal Notes">
          <div className="space-y-3">
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add an internal note"
            />
            <Button
              size="sm"
              className="bg-[#1B6EF3] hover:bg-[#1558C8]"
              onClick={() => {
                if (!note.trim()) {
                  toast.error("Enter a note before saving.");
                  return;
                }
                addNote(item.requestId, note.trim());
                setNote("");
                toast.success("Note added.");
              }}
            >
              Add note
            </Button>
            {item.notes.length === 0 ? (
              <p className="text-sm text-slate-500">No notes yet.</p>
            ) : (
              <ul className="space-y-2">
                {item.notes.map((row) => (
                  <li
                    key={row.id}
                    className="rounded-md border border-slate-100 bg-slate-50 p-3 text-sm"
                  >
                    <p className="text-slate-800">{row.text}</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {row.author} · {formatDateTime(row.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
        ) : null}
        <Card title="Audit History" className="lg:col-span-3">
          <Timeline
            items={item.activity.map((row) => ({
              id: row.id,
              title: row.message,
              description: row.actor,
              time: formatDateTime(row.at),
              status: "info",
            }))}
          />
        </Card>
      </div>

      {item.status === "APPROVED" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Request approved. Next action: Create Purchase Order.
        </div>
      ) : null}

      <ApproveDialog
        item={item}
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        onConfirm={() => onApprove(item)}
      />
      <RejectDialog
        item={item}
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={(reason: RejectionReason, remarks: string) => {
          rejectRequest(item.requestId, reason, remarks);
          toast.success("Purchase Request rejected.");
        }}
      />
      <AssignSellerDialog
        item={item}
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onConfirm={(sellers) => {
          assignSellers(item.requestId, sellers);
          toast.success(`RFQ sent to ${sellers.length} sellers.`);
          setAssignOpen(false);
        }}
      />
      <QuoteDrawer
        item={item}
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        onSubmit={(input) => {
          submitQuote(item.requestId, input);
          toast.success(input.asDraft ? "Draft saved." : "Quote submitted.");
        }}
      />
      <EditRequestDrawer
        item={item}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(patch) => {
          updateItem(item.requestId, patch);
          setEditOpen(false);
          toast.success("Request updated.");
        }}
      />
    </OperationsShell>
  );
}

function EditRequestDrawer({
  item,
  open,
  onClose,
  onSave,
}: {
  item: ProcurementItem;
  open: boolean;
  onClose: () => void;
  onSave: (patch: Partial<ProcurementItem>) => void;
}) {
  const [destination, setDestination] = useState(item.destination);
  const [priority, setPriority] = useState(item.priority);
  const [remarks, setRemarks] = useState(item.internalRemarks);

  return (
    <ActionDrawer
      open={open}
      onClose={onClose}
      title={`Edit ${item.requestId}`}
      widthClassName="w-full max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-[#1B6EF3] hover:bg-[#1558C8]"
            onClick={() =>
              onSave({
                destination,
                priority,
                internalRemarks: remarks,
              })
            }
          >
            Save changes
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <Label>Destination</Label>
          <Input
            className="mt-1.5"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
          />
        </div>
        <div>
          <Label>Priority</Label>
          <Select
            value={priority}
            onValueChange={(value) =>
              setPriority(value as ProcurementItem["priority"])
            }
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Internal Remarks</Label>
          <Textarea
            className="mt-1.5"
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
          />
        </div>
      </div>
    </ActionDrawer>
  );
}
