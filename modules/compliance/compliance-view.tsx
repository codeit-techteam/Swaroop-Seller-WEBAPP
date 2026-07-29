"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  ComplianceDrawer,
  ComplianceLoadingSkeleton,
  ComplianceSummaryCards,
  ComplianceTable,
  DownloadPreviewModal,
  FastTrackModal,
  FilterBar,
  SearchBar,
  UploadDocumentModal,
  WarningBanner,
} from "@/components/compliance";
import { ExportDropdown } from "@/components/erp";
import { cn } from "@/lib/utils";
import { useComplianceStore } from "@/store/complianceStore";
import type { ComplianceDocument, ComplianceSummary } from "@/types/compliance";

interface ComplianceViewProps {
  initialDocumentId?: string;
}

export function ComplianceView({ initialDocumentId }: ComplianceViewProps) {
  const router = useRouter();
  const [bootstrapping, setBootstrapping] = useState(true);

  const filters = useComplianceStore((s) => s.filters);
  const summaryBase = useComplianceStore((s) => s.summary);
  const setSearch = useComplianceStore((s) => s.setSearch);
  const setFilter = useComplianceStore((s) => s.setFilter);
  const resetFilters = useComplianceStore((s) => s.resetFilters);
  const page = useComplianceStore((s) => s.page);
  const pageSize = useComplianceStore((s) => s.pageSize);
  const sort = useComplianceStore((s) => s.sort);
  const setPage = useComplianceStore((s) => s.setPage);
  const setSort = useComplianceStore((s) => s.setSort);
  const selectedDocument = useComplianceStore((s) => s.selectedDocument);
  const drawerOpen = useComplianceStore((s) => s.drawerOpen);
  const openDrawer = useComplianceStore((s) => s.openDrawer);
  const openDrawerById = useComplianceStore((s) => s.openDrawerById);
  const closeDrawer = useComplianceStore((s) => s.closeDrawer);
  const dialogType = useComplianceStore((s) => s.dialogType);
  const dialogDocumentId = useComplianceStore((s) => s.dialogDocumentId);
  const openDialog = useComplianceStore((s) => s.openDialog);
  const closeDialog = useComplianceStore((s) => s.closeDialog);
  const uploadProgress = useComplianceStore((s) => s.uploadProgress);
  const isUploading = useComplianceStore((s) => s.isUploading);
  const uploadNewVersion = useComplianceStore((s) => s.uploadNewVersion);
  const requestFastTrack = useComplianceStore((s) => s.requestFastTrack);
  const downloadDocument = useComplianceStore((s) => s.downloadDocument);
  const exportCsv = useComplianceStore((s) => s.exportCsv);
  const getFilteredDocuments = useComplianceStore(
    (s) => s.getFilteredDocuments,
  );
  const getPaginatedDocuments = useComplianceStore(
    (s) => s.getPaginatedDocuments,
  );
  const getComputedSummary = useComplianceStore((s) => s.getComputedSummary);
  const getWarningFlags = useComplianceStore((s) => s.getWarningFlags);
  const documents = useComplianceStore((s) => s.documents);

  useEffect(() => {
    const timer = window.setTimeout(() => setBootstrapping(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!initialDocumentId) return;
    const found = openDrawerById(initialDocumentId);
    if (!found) {
      toast.error("Document not found");
    }
  }, [initialDocumentId, openDrawerById]);

  const filtered = getFilteredDocuments();
  const paginated = getPaginatedDocuments();
  const warnings = getWarningFlags();

  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    filters.status !== "all" ||
    filters.documentType !== "all" ||
    filters.expiryWindow !== "all";

  const summary = hasActiveFilters ? getComputedSummary() : summaryBase;

  const dialogDocument =
    documents.find((d) => d.id === dialogDocumentId) ??
    selectedDocument ??
    null;

  const handleSummaryClick = (key: keyof ComplianceSummary) => {
    if (key === "verified") setFilter("status", "verified");
    if (key === "expiringSoon") setFilter("status", "expiring_soon");
    if (key === "expired") setFilter("status", "expired");
    if (key === "pendingVerification") setFilter("status", "pending_review");
  };

  const handleOpen = (document: ComplianceDocument) => {
    openDrawer(document);
    router.push(`/compliance/${document.documentId}`, { scroll: false });
  };

  const handleCloseDrawer = () => {
    closeDrawer();
    router.push("/compliance", { scroll: false });
  };

  const handleUpload = (document: ComplianceDocument) => {
    openDrawer(document);
    router.push(`/compliance/${document.documentId}`, { scroll: false });
    openDialog("upload", document.id);
  };

  const handleDownload = (document: ComplianceDocument) => {
    downloadDocument(document.id);
    toast.success(`Opening preview for ${document.name}`);
  };

  const handlePreview = (document: ComplianceDocument) => {
    openDrawer(document);
    router.push(`/compliance/${document.documentId}`, { scroll: false });
    openDialog("download_preview", document.id);
  };

  const handleFastTrack = (document: ComplianceDocument) => {
    openDrawer(document);
    router.push(`/compliance/${document.documentId}`, { scroll: false });
    openDialog("fast_track", document.id);
  };

  const handleExport = () => {
    exportCsv();
    toast.success("CSV export downloaded");
  };

  if (bootstrapping) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6">
        <ComplianceLoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Compliance &gt; Compliance Center
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Compliance Center
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Manage and track business certifications for trading eligibility.
            Update expired documents to avoid service suspension.
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <SearchBar
            value={filters.search}
            onChange={setSearch}
            className="flex-1 sm:flex-none"
          />
          <ExportDropdown
            label="Export"
            variant="outline"
            formats={["CSV", "PDF", "Excel"]}
          />
        </div>
      </div>

      <WarningBanner
        hasExpired={warnings.hasExpired}
        hasPending={warnings.hasPending}
        hasRejected={warnings.hasRejected}
        hasRenewalRequired={warnings.hasRenewalRequired}
        onFilterExpired={() => setFilter("status", "expired")}
        onFilterPending={() => setFilter("status", "pending_review")}
        onFilterRejected={() => setFilter("status", "rejected")}
        onFilterExpiring={() => setFilter("status", "expiring_soon")}
      />

      <ComplianceSummaryCards
        summary={summary}
        onCardClick={handleSummaryClick}
      />

      <FilterBar
        filters={filters}
        onFilterChange={setFilter}
        onReset={resetFilters}
      />

      <div
        className={cn(
          "flex flex-col gap-0 xl:flex-row xl:items-stretch",
          drawerOpen &&
            "xl:overflow-hidden xl:rounded-xl xl:border xl:border-slate-200 xl:bg-white xl:shadow-sm",
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={cn(
            "min-w-0 flex-1",
            drawerOpen && "xl:border-r xl:border-slate-100",
          )}
        >
          <ComplianceTable
            documents={paginated}
            selectedId={selectedDocument?.id ?? null}
            sort={sort}
            page={page}
            pageSize={pageSize}
            totalItems={filtered.length}
            filters={filters}
            hasFilters={hasActiveFilters}
            onSort={setSort}
            onPageChange={setPage}
            onOpen={handleOpen}
            onUpload={handleUpload}
            onDownload={handleDownload}
            onPreview={handlePreview}
            onFastTrack={handleFastTrack}
            onExport={handleExport}
            className={cn(
              drawerOpen && "xl:rounded-none xl:border-0 xl:shadow-none",
            )}
          />
        </motion.div>

        <div className="hidden xl:block">
          <ComplianceDrawer
            open={drawerOpen}
            document={selectedDocument}
            variant="inline"
            onClose={handleCloseDrawer}
            onUpload={() =>
              selectedDocument && openDialog("upload", selectedDocument.id)
            }
            onDownload={() =>
              selectedDocument && downloadDocument(selectedDocument.id)
            }
            onFastTrack={() =>
              selectedDocument && openDialog("fast_track", selectedDocument.id)
            }
          />
        </div>
      </div>

      <div className="xl:hidden">
        <ComplianceDrawer
          open={drawerOpen}
          document={selectedDocument}
          variant="overlay"
          onClose={handleCloseDrawer}
          onUpload={() =>
            selectedDocument && openDialog("upload", selectedDocument.id)
          }
          onDownload={() =>
            selectedDocument && downloadDocument(selectedDocument.id)
          }
          onFastTrack={() =>
            selectedDocument && openDialog("fast_track", selectedDocument.id)
          }
        />
      </div>

      <UploadDocumentModal
        open={dialogType === "upload"}
        document={dialogDocument}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        onClose={closeDialog}
        onUpload={async (file) => {
          if (!dialogDocument) return;
          await uploadNewVersion(dialogDocument.id, file);
        }}
      />

      <FastTrackModal
        open={dialogType === "fast_track"}
        document={dialogDocument}
        onClose={closeDialog}
        onSubmit={(reason, comment) => {
          if (!dialogDocument) return;
          requestFastTrack(dialogDocument.id, reason, comment);
        }}
      />

      <DownloadPreviewModal
        open={dialogType === "download_preview"}
        document={dialogDocument}
        onClose={closeDialog}
      />
    </div>
  );
}
