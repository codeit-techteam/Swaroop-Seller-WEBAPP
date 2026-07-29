"use client";

import {
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OfferReviewDocument } from "@/types/offer-review";

interface DocumentListProps {
  documents: OfferReviewDocument[];
  onDownload?: (documentId: string) => void;
  onPreview?: (documentId: string) => void;
  className?: string;
}

function fileIconClass(fileType: string) {
  if (fileType === "XLSX" || fileType === "XLS") {
    return "bg-emerald-50 text-emerald-600";
  }
  return "bg-red-50 text-red-500";
}

interface DocumentCardProps {
  document: OfferReviewDocument;
  onDownload?: () => void;
  onPreview?: () => void;
}

function DocumentCard({ document, onDownload, onPreview }: DocumentCardProps) {
  const [downloading, setDownloading] = useState(false);
  const isSpreadsheet =
    document.fileType === "XLSX" || document.fileType === "XLS";

  const handleDownload = async () => {
    setDownloading(true);
    toast.loading(`Downloading ${document.name}...`, { id: document.id });
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success(`${document.name} downloaded`, { id: document.id });
    setDownloading(false);
    onDownload?.();
  };

  const handlePreview = () => {
    toast.success(`Previewing ${document.name} (mock)`);
    onPreview?.();
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            fileIconClass(document.fileType),
          )}
        >
          {isSpreadsheet ? (
            <FileSpreadsheet className="h-4 w-4" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">
            {document.name}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {document.fileType} · {document.sizeLabel}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-500"
          onClick={handlePreview}
          aria-label={`Preview ${document.name}`}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#1B6EF3]"
          disabled={downloading}
          onClick={handleDownload}
          aria-label={`Download ${document.name}`}
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

export function DocumentList({
  documents,
  onDownload,
  onPreview,
  className,
}: DocumentListProps) {
  if (documents.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Submitted Documents
      </h4>
      <div className="space-y-2">
        {documents.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            onDownload={() => onDownload?.(document.id)}
            onPreview={() => onPreview?.(document.id)}
          />
        ))}
      </div>
    </div>
  );
}
