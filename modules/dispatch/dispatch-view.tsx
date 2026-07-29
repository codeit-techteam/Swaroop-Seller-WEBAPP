"use client";

import { motion } from "framer-motion";
import { CalendarDays, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import toast from "react-hot-toast";

import {
  AssignVehicleModal,
  DispatchDrawer,
  DispatchFilterBar,
  DispatchSummaryCards,
  DispatchTable,
  DispatchTabs,
  GenerateEwayModal,
  ReleaseShipmentModal,
  SearchBar,
} from "@/components/dispatch";
import { LoadingOverlay } from "@/components/marketplace/loading-overlay";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useDispatchStore } from "@/store/dispatchStore";
import type { DispatchOrder } from "@/types/dispatch";

interface DispatchOperationsViewProps {
  initialDispatchId?: string;
}

export function DispatchOperationsView({
  initialDispatchId,
}: DispatchOperationsViewProps) {
  const filters = useDispatchStore((s) => s.filters);
  const activeTab = useDispatchStore((s) => s.activeTab);
  const page = useDispatchStore((s) => s.page);
  const pageSize = useDispatchStore((s) => s.pageSize);
  const selectedDispatch = useDispatchStore((s) => s.selectedDispatch);
  const panelOpen = useDispatchStore((s) => s.panelOpen);
  const isRefreshing = useDispatchStore((s) => s.isRefreshing);
  const dialogType = useDispatchStore((s) => s.dialogType);
  const dialogDispatchId = useDispatchStore((s) => s.dialogDispatchId);
  const assignForm = useDispatchStore((s) => s.assignForm);
  const ewayForm = useDispatchStore((s) => s.ewayForm);
  const vehicleOptions = useDispatchStore((s) => s.vehicleOptions);
  const driverOptions = useDispatchStore((s) => s.driverOptions);
  const transportCompanyOptions = useDispatchStore(
    (s) => s.transportCompanyOptions,
  );

  const setSearch = useDispatchStore((s) => s.setSearch);
  const setFilter = useDispatchStore((s) => s.setFilter);
  const resetFilters = useDispatchStore((s) => s.resetFilters);
  const setActiveTab = useDispatchStore((s) => s.setActiveTab);
  const setPage = useDispatchStore((s) => s.setPage);
  const selectDispatch = useDispatchStore((s) => s.selectDispatch);
  const selectDispatchById = useDispatchStore((s) => s.selectDispatchById);
  const closePanel = useDispatchStore((s) => s.closePanel);
  const openDialog = useDispatchStore((s) => s.openDialog);
  const closeDialog = useDispatchStore((s) => s.closeDialog);
  const setAssignForm = useDispatchStore((s) => s.setAssignForm);
  const setEwayForm = useDispatchStore((s) => s.setEwayForm);
  const assignVehicle = useDispatchStore((s) => s.assignVehicle);
  const generateEway = useDispatchStore((s) => s.generateEway);
  const releaseShipment = useDispatchStore((s) => s.releaseShipment);
  const refreshData = useDispatchStore((s) => s.refreshData);
  const exportCsv = useDispatchStore((s) => s.exportCsv);
  const downloadDocument = useDispatchStore((s) => s.downloadDocument);
  const previewDocument = useDispatchStore((s) => s.previewDocument);
  const getFilteredDispatches = useDispatchStore(
    (s) => s.getFilteredDispatches,
  );
  const getPaginatedDispatches = useDispatchStore(
    (s) => s.getPaginatedDispatches,
  );
  const getComputedSummary = useDispatchStore((s) => s.getComputedSummary);
  const getTabCounts = useDispatchStore((s) => s.getTabCounts);
  const getDispatchById = useDispatchStore((s) => s.getDispatchById);

  useEffect(() => {
    if (initialDispatchId) {
      selectDispatchById(initialDispatchId);
    }
  }, [initialDispatchId, selectDispatchById]);

  const summary = getComputedSummary();
  const filtered = getFilteredDispatches();
  const paginated = getPaginatedDispatches();
  const tabCounts = getTabCounts();
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const dialogDispatch = dialogDispatchId
    ? (getDispatchById(dialogDispatchId) ?? null)
    : null;

  const hasFilters =
    Boolean(filters.search.trim()) ||
    filters.warehouse !== "All Warehouses" ||
    filters.status !== "All Statuses" ||
    filters.destination !== "All Destinations" ||
    filters.material !== "All Materials";

  const handleRefresh = async () => {
    await refreshData();
    toast.success("Dispatch queue updated");
  };

  const handleExport = () => {
    exportCsv();
    toast.success("CSV exported");
  };

  const openFor =
    (type: "assign_vehicle" | "generate_eway" | "release") =>
    (order: DispatchOrder) => {
      selectDispatch(order);
      openDialog(type, order.id);
    };

  const handleAssign = () => {
    if (!dialogDispatch) return;
    assignVehicle(dialogDispatch.id);
    toast.success("Vehicle Assigned Successfully");
  };

  const handleGenerateEway = () => {
    if (!dialogDispatch) return;
    const result = generateEway(dialogDispatch.id);
    toast.success(`E-Way Bill ${result.ewayBillNumber} generated`);
  };

  const handleRelease = () => {
    if (!dialogDispatch) return;
    const result = releaseShipment(dialogDispatch.id);
    if (!result.ok) {
      toast.error(result.reason ?? "Unable to release shipment");
      return;
    }
    toast.success("Dispatch Released");
  };

  const handleDownload = async (documentId: string) => {
    if (!selectedDispatch) return;
    toast.loading("Downloading document...", { id: "dsp-doc" });
    const result = await downloadDocument(selectedDispatch.id, documentId);
    if (result === "ok") {
      toast.success("Document downloaded", { id: "dsp-doc" });
    } else {
      toast.error("Download failed. Document may be pending.", {
        id: "dsp-doc",
      });
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Operations
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Dispatch Operations Center
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Manage dispatch workflow from payment approval to shipment release
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            asChild
            variant="outline"
            className="h-10 gap-2 border-slate-200"
          >
            <Link href={ROUTES.VEHICLE_SLOT_BOOKING}>
              <CalendarDays className="h-4 w-4" />
              Slot Booking
            </Link>
          </Button>
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

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBar
          value={filters.search}
          onChange={setSearch}
          className="w-full lg:max-w-md"
          placeholder="Search order, material, truck, buyer, vehicle..."
        />
      </div>

      <DispatchSummaryCards summary={summary} />

      <DispatchFilterBar
        filters={filters}
        onFilterChange={setFilter}
        onClear={() => {
          resetFilters();
          toast.success("Filters cleared");
        }}
      />

      <DispatchTabs
        activeTab={activeTab}
        counts={tabCounts}
        onChange={setActiveTab}
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DispatchTable
          dispatches={paginated}
          selectedId={selectedDispatch?.id}
          totalItems={filtered.length}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          isLoading={isRefreshing}
          hasFilters={hasFilters}
          onPageChange={setPage}
          onSelect={selectDispatch}
          onAssignTruck={openFor("assign_vehicle")}
          onGenerateEway={openFor("generate_eway")}
          onRelease={openFor("release")}
          onView={selectDispatch}
          onExport={handleExport}
        />
      </motion.div>

      <DispatchDrawer
        open={panelOpen}
        dispatch={selectedDispatch}
        onClose={closePanel}
        onAssignVehicle={() =>
          selectedDispatch && openDialog("assign_vehicle", selectedDispatch.id)
        }
        onGenerateEway={() =>
          selectedDispatch && openDialog("generate_eway", selectedDispatch.id)
        }
        onReleaseShipment={() =>
          selectedDispatch && openDialog("release", selectedDispatch.id)
        }
        onDownloadDocument={handleDownload}
        onPreviewDocument={(documentId) => {
          if (!selectedDispatch) return;
          previewDocument(selectedDispatch.id, documentId);
        }}
      />

      <AssignVehicleModal
        open={dialogType === "assign_vehicle"}
        dispatch={dialogDispatch}
        form={assignForm}
        vehicles={vehicleOptions}
        drivers={driverOptions}
        companies={transportCompanyOptions}
        onFormChange={setAssignForm}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onAssign={handleAssign}
      />

      <GenerateEwayModal
        open={dialogType === "generate_eway"}
        dispatch={dialogDispatch}
        form={ewayForm}
        onFormChange={setEwayForm}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onGenerate={handleGenerateEway}
      />

      <ReleaseShipmentModal
        open={dialogType === "release"}
        dispatch={dialogDispatch}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onConfirm={handleRelease}
      />

      <LoadingOverlay
        open={isRefreshing}
        message="Refreshing dispatch queue..."
      />
    </div>
  );
}
