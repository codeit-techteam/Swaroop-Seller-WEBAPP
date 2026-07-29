"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  ConfirmationModal,
  FilterBar,
  HistoryModal,
  MoreFiltersDrawer,
  OfferReviewDrawer,
  OfferReviewLoadingSkeleton,
  OfferReviewSummaryCards,
  OfferReviewTable,
  SuccessDialog,
  WithdrawModal,
} from "@/components/offer-review";
import { ROUTES } from "@/lib/constants";
import { useOfferReviewStore } from "@/store/offerReviewStore";
import type { OfferReview, OfferReviewSummaryKey } from "@/types/offer-review";

interface OfferReviewViewProps {
  initialOfferId?: string;
}

export function OfferReviewView({ initialOfferId }: OfferReviewViewProps) {
  const router = useRouter();
  const [bootstrapping, setBootstrapping] = useState(true);

  const filters = useOfferReviewStore((s) => s.filters);
  const summaryBase = useOfferReviewStore((s) => s.summary);
  const setSearch = useOfferReviewStore((s) => s.setSearch);
  const setFilter = useOfferReviewStore((s) => s.setFilter);
  const resetFilters = useOfferReviewStore((s) => s.resetFilters);
  const page = useOfferReviewStore((s) => s.page);
  const pageSize = useOfferReviewStore((s) => s.pageSize);
  const sort = useOfferReviewStore((s) => s.sort);
  const setPage = useOfferReviewStore((s) => s.setPage);
  const setSort = useOfferReviewStore((s) => s.setSort);
  const selectedOffer = useOfferReviewStore((s) => s.selectedOffer);
  const drawerOpen = useOfferReviewStore((s) => s.drawerOpen);
  const drawerLoading = useOfferReviewStore((s) => s.drawerLoading);
  const openDrawer = useOfferReviewStore((s) => s.openDrawer);
  const openDrawerById = useOfferReviewStore((s) => s.openDrawerById);
  const closeDrawer = useOfferReviewStore((s) => s.closeDrawer);
  const dialogType = useOfferReviewStore((s) => s.dialogType);
  const dialogOfferId = useOfferReviewStore((s) => s.dialogOfferId);
  const successMessage = useOfferReviewStore((s) => s.successMessage);
  const openDialog = useOfferReviewStore((s) => s.openDialog);
  const closeDialog = useOfferReviewStore((s) => s.closeDialog);
  const moreFiltersOpen = useOfferReviewStore((s) => s.moreFiltersOpen);
  const setMoreFiltersOpen = useOfferReviewStore((s) => s.setMoreFiltersOpen);
  const resubmitOffer = useOfferReviewStore((s) => s.resubmitOffer);
  const withdrawOffer = useOfferReviewStore((s) => s.withdrawOffer);
  const duplicateOffer = useOfferReviewStore((s) => s.duplicateOffer);
  const getFilteredOffers = useOfferReviewStore((s) => s.getFilteredOffers);
  const getPaginatedOffers = useOfferReviewStore((s) => s.getPaginatedOffers);
  const getComputedSummary = useOfferReviewStore((s) => s.getComputedSummary);
  const applySummaryFilter = useOfferReviewStore((s) => s.applySummaryFilter);
  const offers = useOfferReviewStore((s) => s.offers);

  useEffect(() => {
    const timer = window.setTimeout(() => setBootstrapping(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!initialOfferId) return;
    const found = openDrawerById(initialOfferId);
    if (!found) {
      toast.error("Offer not found");
    }
  }, [initialOfferId, openDrawerById]);

  const filtered = getFilteredOffers();
  const paginated = getPaginatedOffers();

  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    filters.status !== "all" ||
    filters.productGrade !== "all" ||
    filters.warehouse !== "all" ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo) ||
    Boolean(filters.minQuantity) ||
    Boolean(filters.maxQuantity);

  const summary = hasActiveFilters ? getComputedSummary() : summaryBase;

  const dialogOffer =
    offers.find((o) => o.id === dialogOfferId) ?? selectedOffer ?? null;

  const handleSummaryClick = (key: OfferReviewSummaryKey) => {
    applySummaryFilter(key);
  };

  const handleView = (offer: OfferReview) => {
    openDrawer(offer);
  };

  const handleEdit = (offer: OfferReview) => {
    router.push(`${ROUTES.OFFERS_EDIT}/${offer.id}`);
  };

  const handleDuplicate = (offer: OfferReview) => {
    openDialog("duplicate", offer.id);
  };

  const handleWithdraw = (offer: OfferReview) => {
    openDialog("withdraw", offer.id);
  };

  const handleHistory = (offer: OfferReview) => {
    openDrawer(offer);
    openDialog("history", offer.id);
  };

  const confirmDuplicate = () => {
    if (!dialogOffer) return;
    const duplicate = duplicateOffer(dialogOffer.id);
    closeDialog();
    if (duplicate) {
      toast.success(`Draft offer ${duplicate.offerId} created`);
      router.push(`${ROUTES.OFFERS_CREATE}?duplicate=${duplicate.id}`);
    }
  };

  const confirmResubmit = () => {
    if (!dialogOffer) return;
    resubmitOffer(dialogOffer.id);
    toast.success("Offer re-submitted for review");
  };

  const confirmWithdraw = (reason: string) => {
    if (!dialogOffer) return;
    withdrawOffer(dialogOffer.id, reason);
    closeDialog();
    toast.success("Offer withdrawn successfully");
  };

  if (bootstrapping) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-6">
        <OfferReviewLoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-6 md:px-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Compliance &gt; Offer Review Status
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Offer Review Status
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Track the approval lifecycle of all submitted marketplace offers.
        </p>
      </div>

      <OfferReviewSummaryCards
        summary={summary}
        onCardClick={handleSummaryClick}
      />

      <FilterBar
        filters={filters}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
        onReset={resetFilters}
        onMoreFilters={() => setMoreFiltersOpen(true)}
      />

      <OfferReviewTable
        offers={paginated}
        selectedId={selectedOffer?.id ?? null}
        sort={sort}
        page={page}
        pageSize={pageSize}
        totalItems={filtered.length}
        hasFilters={hasActiveFilters}
        onSort={setSort}
        onPageChange={setPage}
        onView={handleView}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onWithdraw={handleWithdraw}
        onHistory={handleHistory}
      />

      <OfferReviewDrawer
        open={drawerOpen}
        offer={selectedOffer}
        loading={drawerLoading}
        onClose={closeDrawer}
        onResubmit={() => openDialog("resubmit", selectedOffer?.id)}
        onDuplicate={() =>
          selectedOffer && openDialog("duplicate", selectedOffer.id)
        }
        onWithdraw={() =>
          selectedOffer && openDialog("withdraw", selectedOffer.id)
        }
        onEdit={() => selectedOffer && handleEdit(selectedOffer)}
      />

      <MoreFiltersDrawer
        open={moreFiltersOpen}
        filters={filters}
        onClose={() => setMoreFiltersOpen(false)}
        onFilterChange={setFilter}
        onReset={resetFilters}
      />

      <WithdrawModal
        open={dialogType === "withdraw"}
        offer={dialogOffer}
        onClose={closeDialog}
        onConfirm={confirmWithdraw}
      />

      <ConfirmationModal
        open={dialogType === "duplicate"}
        onOpenChange={(open) => !open && closeDialog()}
        title="Duplicate Offer"
        description={
          dialogOffer
            ? `Create a new draft copy of offer ${dialogOffer.offerId}? You will be redirected to edit the duplicated offer.`
            : "Create a duplicate of this offer?"
        }
        confirmLabel="Duplicate Offer"
        onConfirm={confirmDuplicate}
      />

      <ConfirmationModal
        open={dialogType === "resubmit"}
        onOpenChange={(open) => !open && closeDialog()}
        title="Re-submit Offer"
        description="Confirm that you have addressed all requested changes. Your offer will be sent back for admin review."
        confirmLabel="Re-submit for Review"
        onConfirm={confirmResubmit}
      />

      <HistoryModal
        open={dialogType === "history"}
        offer={dialogOffer}
        onClose={closeDialog}
      />

      <SuccessDialog
        open={dialogType === "success"}
        message={successMessage}
        onClose={closeDialog}
      />
    </div>
  );
}
