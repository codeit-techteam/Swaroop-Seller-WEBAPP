"use client";

import { FileX2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  hasFilters?: boolean;
  onReset?: () => void;
  onUpload?: () => void;
}

export function EmptyState({
  hasFilters = false,
  onReset,
  onUpload,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <FileX2 className="h-7 w-7 text-slate-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        No Documents
      </h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {hasFilters
          ? "No documents match your current filters. Try adjusting your search or filters."
          : "Upload your first document to get started with compliance management."}
      </p>
      <div className="mt-6 flex gap-2">
        {hasFilters && onReset ? (
          <Button variant="outline" onClick={onReset}>
            Clear Filters
          </Button>
        ) : null}
        {onUpload ? (
          <Button
            className="bg-[#0B1F3A] hover:bg-[#122846]"
            onClick={onUpload}
          >
            Upload New Document
          </Button>
        ) : null}
      </div>
    </div>
  );
}
