"use client";

import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import { SearchBar } from "@/components/dispatch";
import { LoadingOverlay } from "@/components/marketplace/loading-overlay";
import {
  BookingFilterBar,
  BookingTimeline,
  CancelSlotModal,
  ModifySlotModal,
  SlotDetailsPanel,
  VehicleSlotSummary,
  VehicleSlotTable,
} from "@/components/slot-booking";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useSlotBookingStore } from "@/store/slotBookingStore";
import type { SlotBooking } from "@/types/slot-booking";

export function VehicleSlotBookingView() {
  const filters = useSlotBookingStore((s) => s.filters);
  const appliedFilters = useSlotBookingStore((s) => s.appliedFilters);
  const page = useSlotBookingStore((s) => s.page);
  const pageSize = useSlotBookingStore((s) => s.pageSize);
  const selectedSlot = useSlotBookingStore((s) => s.selectedSlot);
  const panelOpen = useSlotBookingStore((s) => s.panelOpen);
  const isRefreshing = useSlotBookingStore((s) => s.isRefreshing);
  const dialogType = useSlotBookingStore((s) => s.dialogType);
  const dialogSlotId = useSlotBookingStore((s) => s.dialogSlotId);
  const modifyForm = useSlotBookingStore((s) => s.modifyForm);

  const setSearch = useSlotBookingStore((s) => s.setSearch);
  const setFilterDraft = useSlotBookingStore((s) => s.setFilterDraft);
  const applyFilters = useSlotBookingStore((s) => s.applyFilters);
  const setPage = useSlotBookingStore((s) => s.setPage);
  const selectSlot = useSlotBookingStore((s) => s.selectSlot);
  const closePanel = useSlotBookingStore((s) => s.closePanel);
  const openDialog = useSlotBookingStore((s) => s.openDialog);
  const closeDialog = useSlotBookingStore((s) => s.closeDialog);
  const setModifyForm = useSlotBookingStore((s) => s.setModifyForm);
  const modifySlot = useSlotBookingStore((s) => s.modifySlot);
  const cancelSlot = useSlotBookingStore((s) => s.cancelSlot);
  const downloadGatePass = useSlotBookingStore((s) => s.downloadGatePass);
  const refreshData = useSlotBookingStore((s) => s.refreshData);
  const getFilteredSlots = useSlotBookingStore((s) => s.getFilteredSlots);
  const getPaginatedSlots = useSlotBookingStore((s) => s.getPaginatedSlots);
  const getComputedSummary = useSlotBookingStore((s) => s.getComputedSummary);
  const getSlotById = useSlotBookingStore((s) => s.getSlotById);

  const summary = getComputedSummary();
  const filtered = getFilteredSlots();
  const paginated = getPaginatedSlots();
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const dialogSlot = dialogSlotId ? (getSlotById(dialogSlotId) ?? null) : null;

  const hasFilters =
    Boolean(appliedFilters.search.trim()) ||
    appliedFilters.warehouse !== "All Warehouses" ||
    Boolean(appliedFilters.dispatchDate) ||
    appliedFilters.shift !== "all" ||
    appliedFilters.vehicleType !== "All Types";

  const timelineSteps =
    selectedSlot?.timeline ??
    paginated[0]?.timeline ??
    filtered[0]?.timeline ??
    [];

  const handleRefresh = async () => {
    await refreshData();
    toast.success("Slot bookings updated");
  };

  const handleApply = () => {
    applyFilters();
    toast.success("Filters applied");
  };

  const handleDownloadGatePass = async (slot: SlotBooking) => {
    toast.loading("Preparing gate pass...", { id: "gate-pass" });
    const result = await downloadGatePass(slot.id);
    if (result === "ok") {
      toast.success("Gate pass downloaded", { id: "gate-pass" });
    } else {
      toast.error("Unable to download gate pass", { id: "gate-pass" });
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2">
            <Button
              asChild
              variant="ghost"
              className="h-8 gap-1.5 px-2 text-slate-500 hover:text-slate-800"
            >
              <Link href={ROUTES.DISPATCH}>
                <ArrowLeft className="h-3.5 w-3.5" />
                Dispatch Operations
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Vehicle Slot Booking
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Manage warehouse loading appointments and transporter scheduling
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SearchBar
            value={filters.search}
            onChange={setSearch}
            placeholder="Search PR ID or Vehicle..."
            className="w-full sm:w-72"
          />
          <Button
            className="h-10 gap-2 bg-[#1B6EF3] hover:bg-[#1558C8]"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>

      <VehicleSlotSummary summary={summary} />

      <BookingFilterBar
        filters={filters}
        onFilterChange={setFilterDraft}
        onApply={handleApply}
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <VehicleSlotTable
          slots={paginated}
          selectedId={selectedSlot?.id}
          totalItems={filtered.length}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          isLoading={isRefreshing}
          hasFilters={hasFilters}
          onPageChange={setPage}
          onSelect={selectSlot}
          onModify={(slot) => openDialog("modify", slot.id)}
          onCancel={(slot) => openDialog("cancel", slot.id)}
          onDownloadGatePass={handleDownloadGatePass}
        />
      </motion.div>

      <BookingTimeline steps={timelineSteps} />

      <SlotDetailsPanel
        open={panelOpen}
        slot={selectedSlot}
        onClose={closePanel}
        onDownloadGatePass={() => {
          if (selectedSlot) void handleDownloadGatePass(selectedSlot);
        }}
        onModify={() => selectedSlot && openDialog("modify", selectedSlot.id)}
        onCancel={() => selectedSlot && openDialog("cancel", selectedSlot.id)}
      />

      <ModifySlotModal
        open={dialogType === "modify"}
        slot={dialogSlot}
        form={modifyForm}
        onFormChange={setModifyForm}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onSave={() => {
          if (!dialogSlot) return;
          modifySlot(dialogSlot.id);
          toast.success("Slot updated successfully");
        }}
      />

      <CancelSlotModal
        open={dialogType === "cancel"}
        slot={dialogSlot}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onConfirm={() => {
          if (!dialogSlot) return;
          cancelSlot(dialogSlot.id);
          toast.success("Slot cancelled");
        }}
      />

      <LoadingOverlay
        open={isRefreshing}
        message="Refreshing slot bookings..."
      />
    </div>
  );
}
