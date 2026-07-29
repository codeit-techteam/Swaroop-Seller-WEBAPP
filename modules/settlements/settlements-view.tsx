"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  InvoicePreviewModal,
  LoadingSkeleton,
  ReceiptPreviewModal,
  SearchBar,
  SettlementDrawer,
  SettlementSummaryCards,
  SettlementTable,
} from "@/components/settlements";
import { useSettlementStore } from "@/store/settlementStore";
import type { Settlement } from "@/types/settlements";

interface SettlementsViewProps {
  initialSettlementId?: string;
}

export function SettlementsView({ initialSettlementId }: SettlementsViewProps) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);

  const loading = useSettlementStore((s) => s.loading);
  const filters = useSettlementStore((s) => s.filters);
  const sort = useSettlementStore((s) => s.sort);
  const page = useSettlementStore((s) => s.page);
  const pageSize = useSettlementStore((s) => s.pageSize);
  const selectedSettlement = useSettlementStore((s) => s.selectedSettlement);
  const drawerOpen = useSettlementStore((s) => s.drawerOpen);
  const dialogType = useSettlementStore((s) => s.dialogType);
  const dialogSettlementId = useSettlementStore((s) => s.dialogSettlementId);

  const bootstrap = useSettlementStore((s) => s.bootstrap);
  const setSearch = useSettlementStore((s) => s.setSearch);
  const setFilter = useSettlementStore((s) => s.setFilter);
  const resetFilters = useSettlementStore((s) => s.resetFilters);
  const setSort = useSettlementStore((s) => s.setSort);
  const setPage = useSettlementStore((s) => s.setPage);
  const selectSettlement = useSettlementStore((s) => s.selectSettlement);
  const selectSettlementById = useSettlementStore(
    (s) => s.selectSettlementById,
  );
  const closeDrawer = useSettlementStore((s) => s.closeDrawer);
  const openDialog = useSettlementStore((s) => s.openDialog);
  const closeDialog = useSettlementStore((s) => s.closeDialog);
  const exportCsv = useSettlementStore((s) => s.exportCsv);
  const exportExcel = useSettlementStore((s) => s.exportExcel);
  const downloadInvoice = useSettlementStore((s) => s.downloadInvoice);
  const downloadReceipt = useSettlementStore((s) => s.downloadReceipt);
  const printReceipt = useSettlementStore((s) => s.printReceipt);
  const sharePdf = useSettlementStore((s) => s.sharePdf);
  const getFilteredSettlements = useSettlementStore(
    (s) => s.getFilteredSettlements,
  );
  const getPaginatedSettlements = useSettlementStore(
    (s) => s.getPaginatedSettlements,
  );
  const getComputedSummary = useSettlementStore((s) => s.getComputedSummary);
  const getSettlementById = useSettlementStore((s) => s.getSettlementById);
  const getAuditForSettlement = useSettlementStore(
    (s) => s.getAuditForSettlement,
  );
  const hasActiveFilters = useSettlementStore((s) => s.hasActiveFilters);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (initialSettlementId) {
      const found = selectSettlementById(initialSettlementId);
      if (!found) {
        toast.error("Settlement not found");
      }
    }
  }, [initialSettlementId, selectSettlementById]);

  const summary = getComputedSummary();
  const filtered = getFilteredSettlements();
  const paginated = getPaginatedSettlements();
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const activeFilters = hasActiveFilters();

  const dialogSettlement = dialogSettlementId
    ? (getSettlementById(dialogSettlementId) ?? null)
    : null;

  const selectedAudit = selectedSettlement
    ? getAuditForSettlement(selectedSettlement)
    : null;

  const handleSelect = (settlement: Settlement) => {
    selectSettlement(settlement);
    router.push(`/settlements/${settlement.settlementId}`, { scroll: false });
  };

  const handleCloseDrawer = () => {
    closeDrawer();
    router.push("/settlements", { scroll: false });
  };

  const handleExportCsv = () => {
    exportCsv();
    toast.success("CSV export downloaded");
  };

  const handleExportExcel = () => {
    exportExcel();
    toast.success("Excel export downloaded");
  };

  const handleDownloadReceipt = () => {
    if (!selectedSettlement) return;
    if (!selectedSettlement.paymentDetails.utrNumber) {
      openDialog("receipt", selectedSettlement.id);
      return;
    }
    openDialog("receipt", selectedSettlement.id);
  };

  const handleViewSettlement = () => {
    if (!selectedSettlement) return;
    openDialog("view_settlement", selectedSettlement.id);
    toast.success("Settlement details loaded");
  };

  const handleSharePdf = async () => {
    if (!selectedSettlement) return;
    sharePdf(selectedSettlement.id);
    if (!navigator.share) {
      toast.success("Settlement link copied to clipboard");
    }
  };

  const handlePrintReceipt = () => {
    if (!selectedSettlement) return;
    printReceipt(selectedSettlement.id);
    toast.success("Print dialog opened");
  };

  const handleModalDownloadInvoice = () => {
    if (!dialogSettlement) return;
    downloadInvoice(dialogSettlement.id);
    toast.success("Invoice downloaded");
  };

  const handleModalPrintInvoice = () => {
    window.print();
    toast.success("Print dialog opened");
  };

  const handleModalDownloadReceipt = () => {
    if (!dialogSettlement) return;
    downloadReceipt(dialogSettlement.id);
    toast.success("Receipt downloaded");
  };

  const handleModalPrintReceipt = () => {
    if (!dialogSettlement) return;
    printReceipt(dialogSettlement.id);
    toast.success("Print dialog opened");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Operations
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Settlement Dashboard
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Track revenue, settlements, and payment disbursements across all
            orders.
          </p>
        </div>
        <div className="w-full max-w-md">
          <SearchBar
            value={filters.search}
            onChange={setSearch}
            placeholder="Search Settlement ID, Order ID, Invoice, Buyer Company..."
          />
        </div>
      </div>

      <SettlementSummaryCards summary={summary} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SettlementTable
          settlements={paginated}
          selectedId={selectedSettlement?.id}
          totalItems={filtered.length}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          sort={sort}
          filters={filters}
          hasFilters={activeFilters}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onPageChange={setPage}
          onSort={setSort}
          onFilterChange={setFilter}
          onClearFilters={() => {
            resetFilters();
            toast.success("Filters cleared");
          }}
          onSearchChange={setSearch}
          onSelect={handleSelect}
          onExportCsv={handleExportCsv}
          onExportExcel={handleExportExcel}
        />
      </motion.div>

      <SettlementDrawer
        open={drawerOpen}
        settlement={selectedSettlement}
        audit={selectedAudit}
        onClose={handleCloseDrawer}
        onDownloadInvoice={() => {
          if (selectedSettlement) {
            openDialog("invoice", selectedSettlement.id);
          }
        }}
        onDownloadReceipt={handleDownloadReceipt}
        onViewSettlement={handleViewSettlement}
        onSharePdf={handleSharePdf}
        onPrintReceipt={handlePrintReceipt}
      />

      <InvoicePreviewModal
        open={dialogType === "invoice"}
        settlement={dialogSettlement}
        onOpenChange={(open) => !open && closeDialog()}
        onDownload={handleModalDownloadInvoice}
        onPrint={handleModalPrintInvoice}
      />

      <ReceiptPreviewModal
        open={dialogType === "receipt"}
        settlement={dialogSettlement}
        onOpenChange={(open) => !open && closeDialog()}
        onDownload={handleModalDownloadReceipt}
        onPrint={handleModalPrintReceipt}
      />
    </div>
  );
}
