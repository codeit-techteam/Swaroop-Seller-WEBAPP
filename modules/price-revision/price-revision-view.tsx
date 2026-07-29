"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";

import {
  ConfirmationModal,
  HistoryModal,
  LoadingSkeleton,
  PriceRevisionDrawer,
  PriceRevisionSummaryCards,
  PriceRevisionTable,
} from "@/components/price-revision";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { usePriceRevisionStore } from "@/store/priceRevisionStore";
import type {
  CounterOfferDraft,
  PriceRevisionRequest,
} from "@/types/price-revision";
import { REJECT_REASONS } from "@/types/price-revision";

export function PriceRevisionView() {
  const loading = usePriceRevisionStore((s) => s.loading);
  const filters = usePriceRevisionStore((s) => s.filters);
  const sort = usePriceRevisionStore((s) => s.sort);
  const page = usePriceRevisionStore((s) => s.page);
  const pageSize = usePriceRevisionStore((s) => s.pageSize);
  const selectedRequest = usePriceRevisionStore((s) => s.selectedRequest);
  const drawerOpen = usePriceRevisionStore((s) => s.drawerOpen);
  const dialogType = usePriceRevisionStore((s) => s.dialogType);
  const dialogRequestId = usePriceRevisionStore((s) => s.dialogRequestId);
  const counterForm = usePriceRevisionStore((s) => s.counterForm);
  const rejectReason = usePriceRevisionStore((s) => s.rejectReason);
  const rejectRemark = usePriceRevisionStore((s) => s.rejectRemark);

  const bootstrap = usePriceRevisionStore((s) => s.bootstrap);
  const setSearch = usePriceRevisionStore((s) => s.setSearch);
  const setFilter = usePriceRevisionStore((s) => s.setFilter);
  const resetFilters = usePriceRevisionStore((s) => s.resetFilters);
  const setSort = usePriceRevisionStore((s) => s.setSort);
  const setPage = usePriceRevisionStore((s) => s.setPage);
  const openDrawer = usePriceRevisionStore((s) => s.openDrawer);
  const closeDrawer = usePriceRevisionStore((s) => s.closeDrawer);
  const openDialog = usePriceRevisionStore((s) => s.openDialog);
  const closeDialog = usePriceRevisionStore((s) => s.closeDialog);
  const setCounterForm = usePriceRevisionStore((s) => s.setCounterForm);
  const setRejectReason = usePriceRevisionStore((s) => s.setRejectReason);
  const setRejectRemark = usePriceRevisionStore((s) => s.setRejectRemark);
  const acceptRevision = usePriceRevisionStore((s) => s.acceptRevision);
  const submitCounterOffer = usePriceRevisionStore((s) => s.submitCounterOffer);
  const saveDraft = usePriceRevisionStore((s) => s.saveDraft);
  const rejectRevision = usePriceRevisionStore((s) => s.rejectRevision);
  const exportCsv = usePriceRevisionStore((s) => s.exportCsv);
  const exportPdf = usePriceRevisionStore((s) => s.exportPdf);
  const getFilteredRequests = usePriceRevisionStore(
    (s) => s.getFilteredRequests,
  );
  const getPaginatedRequests = usePriceRevisionStore(
    (s) => s.getPaginatedRequests,
  );
  const getComputedSummary = usePriceRevisionStore((s) => s.getComputedSummary);
  const getRequestById = usePriceRevisionStore((s) => s.getRequestById);
  const hasActiveFilters = usePriceRevisionStore((s) => s.hasActiveFilters);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const summary = getComputedSummary();
  const filtered = getFilteredRequests();
  const paginated = getPaginatedRequests();
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const activeFilters = hasActiveFilters();

  const dialogRequest = dialogRequestId
    ? (getRequestById(dialogRequestId) ?? null)
    : null;

  const handleSelect = (request: PriceRevisionRequest) => {
    openDrawer(request);
  };

  const handleReview = (request: PriceRevisionRequest) => {
    openDrawer(request);
  };

  const handleAcceptConfirm = () => {
    if (!dialogRequest) return;
    acceptRevision(dialogRequest.id);
    toast.success("Suggested price accepted successfully");
  };

  const handleCounterSubmit = (data: {
    counterPrice: string;
    moq: string;
    validity: string;
    remarks?: string;
  }) => {
    if (!selectedRequest) return;
    setCounterForm({
      counterPrice: data.counterPrice,
      moq: data.moq,
      validity: data.validity as CounterOfferDraft["validity"],
      remarks: data.remarks ?? "",
    });
    openDialog("counter", selectedRequest.id);
  };

  const handleCounterConfirm = () => {
    if (!dialogRequest || !counterForm.counterPrice || !counterForm.validity)
      return;
    submitCounterOffer(dialogRequest.id, {
      counterPrice: Number(counterForm.counterPrice),
      moq: Number(counterForm.moq),
      validity: counterForm.validity,
      remarks: counterForm.remarks,
    });
    toast.success("Counter offer submitted for admin review");
  };

  const handleExportCsv = () => {
    exportCsv();
    toast.success("CSV export downloaded");
  };

  const handleExportPdf = () => {
    exportPdf();
    toast.success("PDF export downloaded");
  };

  const handleSaveDraft = () => {
    if (!selectedRequest) return;
    openDialog("save_draft", selectedRequest.id);
  };

  const handleSaveDraftConfirm = () => {
    if (!dialogRequest) return;
    saveDraft(dialogRequest.id);
    toast.success("Draft saved locally");
  };

  const handleRejectConfirm = () => {
    if (!dialogRequest || !rejectReason) return;
    rejectRevision(dialogRequest.id, rejectReason, rejectRemark || undefined);
    toast.success("Revision request rejected");
  };

  const formatPrice = (value: number) =>
    formatCurrency(value, { currency: "INR" }).replace(/\.00$/, "");

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-6 md:px-6">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Offers
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Price Revision Requests
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Manage platform-initiated pricing adjustments and market-driven
            negotiations for your marketplace offers.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-10 gap-2 bg-[#0B1F3A] text-white hover:bg-[#122846]">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportPdf}>
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportCsv}>
              Download CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <PriceRevisionSummaryCards summary={summary} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <PriceRevisionTable
          requests={paginated}
          selectedId={selectedRequest?.id}
          totalItems={filtered.length}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          sort={sort}
          filters={filters}
          hasFilters={activeFilters}
          onPageChange={setPage}
          onSort={setSort}
          onFilterChange={setFilter}
          onClearFilters={() => {
            resetFilters();
            toast.success("Filters cleared");
          }}
          onSearchChange={setSearch}
          onSelect={handleSelect}
          onReview={handleReview}
          onViewStatus={(r) => {
            openDrawer(r);
          }}
          onDetails={(r) => openDrawer(r)}
          onHistory={(r) => openDialog("history", r.id)}
        />
      </motion.div>

      <PriceRevisionDrawer
        open={drawerOpen}
        request={selectedRequest}
        counterForm={counterForm}
        onClose={closeDrawer}
        onCounterFormChange={setCounterForm}
        onAccept={() =>
          selectedRequest && openDialog("accept", selectedRequest.id)
        }
        onSubmitCounter={handleCounterSubmit}
        onSaveDraft={handleSaveDraft}
        onReject={() =>
          selectedRequest && openDialog("reject", selectedRequest.id)
        }
      />

      <ConfirmationModal
        open={dialogType === "accept"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        title="Accept Suggested Price"
        description={`Confirm acceptance of the platform suggested price of ${dialogRequest ? formatPrice(dialogRequest.suggestedPrice) : ""}/MT for revision #${dialogRequest?.requestId ?? ""}. Live marketplace pricing will be updated after admin confirmation.`}
        confirmLabel="Accept Price"
        onConfirm={handleAcceptConfirm}
      />

      <ConfirmationModal
        open={dialogType === "counter"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        title="Submit Counter Offer"
        description="Your counter offer will be sent to PetroTrade Admin for review. You cannot directly change live marketplace pricing."
        confirmLabel="Submit Counter"
        onConfirm={handleCounterConfirm}
      />

      <ConfirmationModal
        open={dialogType === "save_draft"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        title="Save Draft"
        description="Save your counter offer draft locally? It will be restored when you reopen this revision."
        confirmLabel="Save Draft"
        onConfirm={handleSaveDraftConfirm}
      />

      <ConfirmationModal
        open={dialogType === "reject"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        title="Reject Revision Request"
        description="Please provide a reason for rejecting this price revision. This action cannot be undone."
        confirmLabel="Reject Request"
        variant="destructive"
        confirmDisabled={!rejectReason}
        onConfirm={handleRejectConfirm}
      >
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Reason *</Label>
            <Select
              value={rejectReason}
              onValueChange={(v) =>
                setRejectReason(v as (typeof REJECT_REASONS)[number])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {REJECT_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Additional Remarks</Label>
            <Textarea
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              placeholder="Optional details..."
              rows={3}
            />
          </div>
        </div>
      </ConfirmationModal>

      <HistoryModal
        open={dialogType === "history"}
        request={dialogRequest}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      />
    </div>
  );
}
