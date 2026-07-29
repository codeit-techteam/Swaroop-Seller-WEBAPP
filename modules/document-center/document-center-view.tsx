"use client";

import { Filter, Upload } from "lucide-react";
import { useEffect, useState } from "react";

import {
  DocumentCenterLoadingSkeleton,
  DocumentSection,
  DocumentSplitSection,
  EmptyState,
  FilterDrawer,
  Pagination,
  PreviewDrawer,
  Search,
  SummaryCards,
  UploadModal,
  VersionHistoryModal,
} from "@/components/document-center";
import { Button } from "@/components/ui/button";
import { useDocumentStore } from "@/store/documentStore";
import type { DocumentCategory, SellerDocument } from "@/types/documents";

const CATEGORIES: DocumentCategory[] = [
  "business_statutory",
  "technical_quality",
  "logistics",
  "marketplace",
];

export function DocumentCenterView() {
  const [bootstrapping, setBootstrapping] = useState(true);

  const filters = useDocumentStore((s) => s.filters);
  const summaryBase = useDocumentStore((s) => s.summary);
  const page = useDocumentStore((s) => s.page);
  const pageSize = useDocumentStore((s) => s.pageSize);
  const filterDrawer = useDocumentStore((s) => s.filterDrawer);
  const uploadModal = useDocumentStore((s) => s.uploadModal);
  const previewModal = useDocumentStore((s) => s.previewModal);
  const versionHistoryModal = useDocumentStore((s) => s.versionHistoryModal);
  const documents = useDocumentStore((s) => s.documents);

  const setSearch = useDocumentStore((s) => s.setSearch);
  const setSearchField = useDocumentStore((s) => s.setSearchField);
  const setFilter = useDocumentStore((s) => s.setFilter);
  const resetFilters = useDocumentStore((s) => s.resetFilters);
  const setPage = useDocumentStore((s) => s.setPage);
  const openFilterDrawer = useDocumentStore((s) => s.openFilterDrawer);
  const closeFilterDrawer = useDocumentStore((s) => s.closeFilterDrawer);
  const applyFilters = useDocumentStore((s) => s.applyFilters);
  const openUploadModal = useDocumentStore((s) => s.openUploadModal);
  const closeUploadModal = useDocumentStore((s) => s.closeUploadModal);
  const setUploadFormField = useDocumentStore((s) => s.setUploadFormField);
  const setUploadFile = useDocumentStore((s) => s.setUploadFile);
  const submitUpload = useDocumentStore((s) => s.submitUpload);
  const openPreview = useDocumentStore((s) => s.openPreview);
  const closePreview = useDocumentStore((s) => s.closePreview);
  const openVersionHistory = useDocumentStore((s) => s.openVersionHistory);
  const closeVersionHistory = useDocumentStore((s) => s.closeVersionHistory);
  const downloadDocument = useDocumentStore((s) => s.downloadDocument);
  const replaceDocument = useDocumentStore((s) => s.replaceDocument);
  const renewDocument = useDocumentStore((s) => s.renewDocument);
  const archiveDocument = useDocumentStore((s) => s.archiveDocument);
  const deleteDocument = useDocumentStore((s) => s.deleteDocument);
  const getFilteredDocuments = useDocumentStore((s) => s.getFilteredDocuments);
  const getPaginatedDocuments = useDocumentStore(
    (s) => s.getPaginatedDocuments,
  );
  const getComputedSummary = useDocumentStore((s) => s.getComputedSummary);

  useEffect(() => {
    const timer = window.setTimeout(() => setBootstrapping(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  const filtered = getFilteredDocuments();
  const paginated = getPaginatedDocuments();

  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    filters.category !== "all" ||
    filters.status !== "all" ||
    filters.expiry !== "all";

  const summary = hasActiveFilters ? getComputedSummary() : summaryBase;

  const previewDocument =
    documents.find((d) => d.id === previewModal.documentId) ?? null;
  const historyDocument =
    documents.find((d) => d.id === versionHistoryModal.documentId) ?? null;

  const categoryTotals = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = filtered.filter((d) => d.category === cat).length;
      return acc;
    },
    {} as Record<DocumentCategory, number>,
  );

  const businessDocs = paginated.filter(
    (d) => d.category === "business_statutory",
  );
  const technicalDocs = paginated.filter(
    (d) => d.category === "technical_quality",
  );
  const logisticsDocs = paginated.filter((d) => d.category === "logistics");
  const marketplaceDocs = paginated.filter((d) => d.category === "marketplace");

  const handlers = {
    onPreview: (doc: SellerDocument) => openPreview(doc.id),
    onDownload: (doc: SellerDocument) => downloadDocument(doc.id),
    onReplace: (doc: SellerDocument) => replaceDocument(doc.id),
    onRenew: (doc: SellerDocument) => renewDocument(doc.id),
    onHistory: (doc: SellerDocument) => openVersionHistory(doc.id),
    onArchive: (doc: SellerDocument) => archiveDocument(doc.id),
    onDelete: (doc: SellerDocument) => deleteDocument(doc.id),
  };

  const handleSummaryClick = (key: keyof typeof summary) => {
    if (key === "pendingVerification") setFilter("status", "pending");
    if (key === "expiringSoon") setFilter("status", "expiring");
    if (key === "totalDocuments") resetFilters();
  };

  if (bootstrapping) {
    return <DocumentCenterLoadingSkeleton />;
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Document Center
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Centralized management for compliance, quality and transactional
            records.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={openFilterDrawer}>
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button
            className="bg-[#0B1F3A] hover:bg-[#122846]"
            onClick={() => openUploadModal("new")}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload New Document
          </Button>
        </div>
      </div>

      <SummaryCards summary={summary} onCardClick={handleSummaryClick} />

      <Search
        search={filters.search}
        searchField={filters.searchField}
        onSearchChange={setSearch}
        onSearchFieldChange={setSearchField}
      />

      {filtered.length === 0 ? (
        <EmptyState
          hasFilters={hasActiveFilters}
          onReset={resetFilters}
          onUpload={() => openUploadModal("new")}
        />
      ) : (
        <div className="space-y-6">
          {businessDocs.length > 0 ? (
            <DocumentSection
              category="business_statutory"
              documents={businessDocs}
              totalInCategory={categoryTotals.business_statutory}
              {...handlers}
            />
          ) : null}

          {technicalDocs.length > 0 ? (
            <DocumentSection
              category="technical_quality"
              documents={technicalDocs}
              totalInCategory={categoryTotals.technical_quality}
              {...handlers}
            />
          ) : null}

          <DocumentSplitSection
            logisticsDocs={logisticsDocs}
            marketplaceDocs={marketplaceDocs}
            logisticsTotal={categoryTotals.logistics}
            marketplaceTotal={categoryTotals.marketplace}
            {...handlers}
          />

          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={filtered.length}
            onPageChange={setPage}
          />
        </div>
      )}

      <FilterDrawer
        open={filterDrawer.open}
        filters={filters}
        onClose={closeFilterDrawer}
        onFilterChange={setFilter}
        onApply={applyFilters}
        onReset={() => {
          resetFilters();
          closeFilterDrawer();
        }}
      />

      <UploadModal
        uploadModal={uploadModal}
        onClose={closeUploadModal}
        onFieldChange={setUploadFormField}
        onFileChange={setUploadFile}
        onSubmit={submitUpload}
      />

      <PreviewDrawer
        open={previewModal.open}
        document={previewDocument}
        onClose={closePreview}
        onDownload={() =>
          previewDocument && downloadDocument(previewDocument.id)
        }
        onReplace={() => previewDocument && replaceDocument(previewDocument.id)}
        onRenew={() => previewDocument && renewDocument(previewDocument.id)}
        onHistory={() =>
          previewDocument && openVersionHistory(previewDocument.id)
        }
      />

      <VersionHistoryModal
        open={versionHistoryModal.open}
        document={historyDocument}
        onClose={closeVersionHistory}
      />
    </div>
  );
}
