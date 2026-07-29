"use client";

import { Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PurchaseDocument } from "@/types/purchase-requests";

interface DocumentDownloadCardProps {
  document: PurchaseDocument;
  onDownload: () => Promise<void>;
  className?: string;
}

export function DocumentDownloadCard({
  document,
  onDownload,
  className,
}: DocumentDownloadCardProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await onDownload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
          <FileText className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">
            {document.name}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{document.sizeLabel}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
            {document.signedBy}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-[#1B6EF3]"
        disabled={loading}
        onClick={handleDownload}
        aria-label={`Download ${document.name}`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
