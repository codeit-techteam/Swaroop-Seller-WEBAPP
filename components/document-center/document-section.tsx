"use client";

import type { DocumentCategory, SellerDocument } from "@/types/documents";
import { DOCUMENT_CATEGORY_LABELS } from "@/types/documents";

import { DocumentCard } from "./document-card";

interface DocumentSectionProps {
  category: DocumentCategory;
  documents: SellerDocument[];
  totalInCategory: number;
  onPreview: (doc: SellerDocument) => void;
  onDownload: (doc: SellerDocument) => void;
  onReplace: (doc: SellerDocument) => void;
  onRenew: (doc: SellerDocument) => void;
  onHistory: (doc: SellerDocument) => void;
  onArchive: (doc: SellerDocument) => void;
  onDelete: (doc: SellerDocument) => void;
}

function gridClass(category: DocumentCategory) {
  switch (category) {
    case "business_statutory":
      return "grid gap-3 md:grid-cols-2 xl:grid-cols-3";
    case "technical_quality":
      return "grid gap-3 md:grid-cols-2";
    case "logistics":
    case "marketplace":
      return "space-y-2";
    default:
      return "grid gap-3";
  }
}

export function DocumentSection({
  category,
  documents,
  totalInCategory,
  onPreview,
  onDownload,
  onReplace,
  onRenew,
  onHistory,
  onArchive,
  onDelete,
}: DocumentSectionProps) {
  if (documents.length === 0) return null;

  const label = DOCUMENT_CATEGORY_LABELS[category];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-slate-900">{label}</h2>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          {totalInCategory} DOCUMENTS
        </span>
      </div>
      <div className={gridClass(category)}>
        {documents.map((doc, index) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            variant={category}
            index={index}
            onPreview={onPreview}
            onDownload={onDownload}
            onReplace={onReplace}
            onRenew={onRenew}
            onHistory={onHistory}
            onArchive={onArchive}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}

/** Side-by-side layout for Logistics + Marketplace */
export function DocumentSplitSection({
  logisticsDocs,
  marketplaceDocs,
  logisticsTotal,
  marketplaceTotal,
  onPreview,
  onDownload,
  onReplace,
  onRenew,
  onHistory,
  onArchive,
  onDelete,
}: {
  logisticsDocs: SellerDocument[];
  marketplaceDocs: SellerDocument[];
  logisticsTotal: number;
  marketplaceTotal: number;
  onPreview: (doc: SellerDocument) => void;
  onDownload: (doc: SellerDocument) => void;
  onReplace: (doc: SellerDocument) => void;
  onRenew: (doc: SellerDocument) => void;
  onHistory: (doc: SellerDocument) => void;
  onArchive: (doc: SellerDocument) => void;
  onDelete: (doc: SellerDocument) => void;
}) {
  if (logisticsDocs.length === 0 && marketplaceDocs.length === 0) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {logisticsDocs.length > 0 ? (
        <DocumentSection
          category="logistics"
          documents={logisticsDocs}
          totalInCategory={logisticsTotal}
          onPreview={onPreview}
          onDownload={onDownload}
          onReplace={onReplace}
          onRenew={onRenew}
          onHistory={onHistory}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ) : null}
      {marketplaceDocs.length > 0 ? (
        <DocumentSection
          category="marketplace"
          documents={marketplaceDocs}
          totalInCategory={marketplaceTotal}
          onPreview={onPreview}
          onDownload={onDownload}
          onReplace={onReplace}
          onRenew={onRenew}
          onHistory={onHistory}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ) : null}
    </div>
  );
}
