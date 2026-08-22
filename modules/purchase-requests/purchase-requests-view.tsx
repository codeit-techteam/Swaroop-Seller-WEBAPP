"use client";

import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { LoadingOverlay } from "@/components/marketplace/loading-overlay";
import {
  AcceptDialog,
  CounterOfferModal,
  PurchaseFilterBar,
  PurchaseRequestTable,
  PurchaseSummaryCards,
  RejectDialog,
  RightDetailsPanel,
} from "@/components/purchase-requests";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { usePurchaseRequestStore } from "@/store/purchaseRequestStore";
import type { PurchaseRequest } from "@/types/purchase-requests";
import { COUNTER_PAYMENT_TERMS } from "@/types/purchase-requests";

export function PurchaseRequestsView() {
  const router = useRouter();

  const filters = usePurchaseRequestStore((s) => s.filters);
  const page = usePurchaseRequestStore((s) => s.page);
  const pageSize = usePurchaseRequestStore((s) => s.pageSize);
  const selectedRequest = usePurchaseRequestStore((s) => s.selectedRequest);
  const panelOpen = usePurchaseRequestStore((s) => s.panelOpen);
  const isRefreshing = usePurchaseRequestStore((s) => s.isRefreshing);
  const dialogType = usePurchaseRequestStore((s) => s.dialogType);
  const dialogRequestId = usePurchaseRequestStore((s) => s.dialogRequestId);
  const rejectReason = usePurchaseRequestStore((s) => s.rejectReason);
  const rejectRemark = usePurchaseRequestStore((s) => s.rejectRemark);

  const setSearch = usePurchaseRequestStore((s) => s.setSearch);
  const setFilter = usePurchaseRequestStore((s) => s.setFilter);
  const resetFilters = usePurchaseRequestStore((s) => s.resetFilters);
  const setPage = usePurchaseRequestStore((s) => s.setPage);
  const selectRequest = usePurchaseRequestStore((s) => s.selectRequest);
  const closePanel = usePurchaseRequestStore((s) => s.closePanel);
  const openDialog = usePurchaseRequestStore((s) => s.openDialog);
  const closeDialog = usePurchaseRequestStore((s) => s.closeDialog);
  const setRejectReason = usePurchaseRequestStore((s) => s.setRejectReason);
  const setRejectRemark = usePurchaseRequestStore((s) => s.setRejectRemark);
  const acceptRequest = usePurchaseRequestStore((s) => s.acceptRequest);
  const rejectRequest = usePurchaseRequestStore((s) => s.rejectRequest);
  const submitCounterOffer = usePurchaseRequestStore(
    (s) => s.submitCounterOffer,
  );
  const refreshData = usePurchaseRequestStore((s) => s.refreshData);
  const downloadDocument = usePurchaseRequestStore((s) => s.downloadDocument);
  const getFilteredRequests = usePurchaseRequestStore(
    (s) => s.getFilteredRequests,
  );
  const getPaginatedRequests = usePurchaseRequestStore(
    (s) => s.getPaginatedRequests,
  );
  const getComputedSummary = usePurchaseRequestStore(
    (s) => s.getComputedSummary,
  );
  const getRequestById = usePurchaseRequestStore((s) => s.getRequestById);

  const summary = getComputedSummary();
  const filtered = getFilteredRequests();
  const paginated = getPaginatedRequests();
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const dialogRequest = dialogRequestId
    ? (getRequestById(dialogRequestId) ?? null)
    : null;

  const hasFilters =
    Boolean(filters.search.trim()) ||
    filters.status !== "All Statuses" ||
    filters.materialGrade !== "All Grades" ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  const handleRefresh = async () => {
    await refreshData();
    toast.success("Purchase Requests Updated");
  };

  const handleAcceptConfirm = () => {
    if (!dialogRequest) return;
    acceptRequest(dialogRequest.id);
    toast.success("Request Accepted Successfully");
  };

  const handleRejectSubmit = () => {
    if (!dialogRequest || !rejectReason) return;
    rejectRequest(dialogRequest.id, rejectReason, rejectRemark || undefined);
    toast.success("Request Rejected");
  };

  const handleCounterSubmit = (
    offer: Parameters<typeof submitCounterOffer>[1],
  ) => {
    if (!dialogRequest) return;
    submitCounterOffer(dialogRequest.id, offer);
    toast.success("Counter Offer Sent");
  };

  const handleViewOrder = (request: PurchaseRequest) => {
    const orderId = request.orderId ?? `ord-${request.id}`;
    router.push(`${ROUTES.ORDERS}/${orderId}`);
  };

  const handleDownload = async (documentId: string) => {
    if (!selectedRequest) return;
    toast.loading("Downloading document...", { id: "doc-download" });
    const result = await downloadDocument(selectedRequest.id, documentId);
    if (result === "ok") {
      toast.success("Document downloaded", { id: "doc-download" });
    } else {
      toast.error("Download Failed. Please try again.", { id: "doc-download" });
    }
  };

  const paymentLabel = (term?: string) =>
    COUNTER_PAYMENT_TERMS.find((t) => t.value === term)?.label ?? term ?? "—";

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Marketplace &gt; Purchase Requests
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Purchase Request Inbox
          </h1>
          <p className="max-w-2xl text-sm text-slate-500">
            Manage incoming material enquiries allocated by PetroTrade
            Procurement.
          </p>
        </div>
        <Button
          className="h-9 gap-2 bg-[#1B6EF3] hover:bg-[#1558C8]"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={cn("h-4 w-4", isRefreshing && "animate-spin")}
          />
          Refresh Data
        </Button>
      </div>

      <PurchaseSummaryCards summary={summary} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <PurchaseFilterBar
          filters={filters}
          onFilterChange={setFilter}
          onSearchChange={setSearch}
          onClearAll={() => {
            resetFilters();
            toast.success("Filters cleared");
          }}
        />

        <PurchaseRequestTable
          embedded
          requests={paginated}
          selectedId={selectedRequest?.id}
          totalItems={filtered.length}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          isLoading={isRefreshing}
          hasFilters={hasFilters}
          onPageChange={setPage}
          onSelect={selectRequest}
          onAccept={(request) => openDialog("accept", request.id)}
          onReject={(request) => openDialog("reject", request.id)}
          onCounter={(request) => openDialog("counter", request.id)}
          onViewOrder={handleViewOrder}
          onHistory={(request) => openDialog("history", request.id)}
          onViewCounter={(request) => openDialog("view_counter", request.id)}
        />
      </motion.div>

      <RightDetailsPanel
        open={panelOpen}
        request={selectedRequest}
        onClose={closePanel}
        onAccept={() =>
          selectedRequest && openDialog("accept", selectedRequest.id)
        }
        onReject={() =>
          selectedRequest && openDialog("reject", selectedRequest.id)
        }
        onCounter={() =>
          selectedRequest && openDialog("counter", selectedRequest.id)
        }
        onViewOrder={() => selectedRequest && handleViewOrder(selectedRequest)}
        onHistory={() =>
          selectedRequest && openDialog("history", selectedRequest.id)
        }
        onViewCounter={() =>
          selectedRequest && openDialog("view_counter", selectedRequest.id)
        }
        onDownloadDocument={handleDownload}
      />

      <AcceptDialog
        open={dialogType === "accept"}
        request={dialogRequest}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onConfirm={handleAcceptConfirm}
      />

      <RejectDialog
        open={dialogType === "reject"}
        request={dialogRequest}
        reason={rejectReason}
        remark={rejectRemark}
        onReasonChange={setRejectReason}
        onRemarkChange={setRejectRemark}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onSubmit={handleRejectSubmit}
      />

      <CounterOfferModal
        open={dialogType === "counter"}
        request={dialogRequest}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onSubmit={handleCounterSubmit}
      />

      <Dialog
        open={dialogType === "history"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request History</DialogTitle>
            <DialogDescription>
              Activity timeline for {dialogRequest?.requestNumber}
            </DialogDescription>
          </DialogHeader>
          {dialogRequest ? (
            <ul className="space-y-3 py-2 text-sm">
              <li className="rounded-lg border border-slate-200 px-3 py-2">
                <p className="font-medium text-slate-800">Request Created</p>
                <p className="text-xs text-slate-500">
                  {new Date(dialogRequest.createdAt).toLocaleString()}
                </p>
              </li>
              <li className="rounded-lg border border-slate-200 px-3 py-2">
                <p className="font-medium text-slate-800">
                  Status: {dialogRequest.status.replace("_", " ")}
                </p>
                <p className="text-xs text-slate-500">
                  Updated {new Date(dialogRequest.updatedAt).toLocaleString()}
                </p>
              </li>
              {dialogRequest.rejectReason ? (
                <li className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                  <p className="font-medium text-red-800">
                    Rejected — {dialogRequest.rejectReason}
                  </p>
                  {dialogRequest.rejectRemark ? (
                    <p className="mt-1 text-xs text-red-700">
                      {dialogRequest.rejectRemark}
                    </p>
                  ) : null}
                </li>
              ) : null}
              {dialogRequest.acceptedAt ? (
                <li className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                  <p className="font-medium text-emerald-800">Accepted</p>
                  <p className="text-xs text-emerald-700">
                    {new Date(dialogRequest.acceptedAt).toLocaleString()}
                  </p>
                </li>
              ) : null}
            </ul>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogType === "view_counter"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Counter Offer Details</DialogTitle>
            <DialogDescription>
              Submitted counter for {dialogRequest?.requestNumber}
            </DialogDescription>
          </DialogHeader>
          {dialogRequest?.counterOffer ? (
            <dl className="space-y-2 py-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Base Price</dt>
                <dd className="font-semibold">
                  ${dialogRequest.counterOffer.basePrice.toFixed(2)} / MT
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">MOQ</dt>
                <dd className="font-semibold">
                  {dialogRequest.counterOffer.moq} MT
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Available Qty</dt>
                <dd className="font-semibold">
                  {dialogRequest.counterOffer.availableQuantity} MT
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Dispatch Date</dt>
                <dd className="font-semibold">
                  {dialogRequest.counterOffer.dispatchDate}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Payment Terms</dt>
                <dd className="font-semibold">
                  {paymentLabel(dialogRequest.counterOffer.paymentTerms)}
                </dd>
              </div>
              {dialogRequest.counterOffer.bulkPricing ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Bulk Pricing</dt>
                  <dd className="font-semibold">
                    {dialogRequest.counterOffer.bulkPricing}
                  </dd>
                </div>
              ) : null}
              {dialogRequest.counterOffer.remarks ? (
                <div>
                  <dt className="text-slate-500">Remarks</dt>
                  <dd className="mt-1 text-slate-700">
                    {dialogRequest.counterOffer.remarks}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <p className="text-sm text-slate-500">No counter offer found.</p>
          )}
        </DialogContent>
      </Dialog>

      <LoadingOverlay
        open={isRefreshing}
        message="Refreshing purchase requests..."
      />
    </div>
  );
}
