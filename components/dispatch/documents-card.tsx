"use client";

import { Download, Eye, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DispatchDocument } from "@/types/dispatch";

interface DocumentsCardProps {
  documents: DispatchDocument[];
  onDownload: (documentId: string) => void;
  onPreview: (documentId: string) => void;
  className?: string;
}

export function DocumentsCard({
  documents,
  onDownload,
  onPreview,
  className,
}: DocumentsCardProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Document Center
      </h4>
      <div className="grid grid-cols-2 gap-2.5">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={cn(
              "rounded-xl border px-3 py-3 transition-shadow",
              doc.available
                ? "border-slate-200 bg-white hover:shadow-sm"
                : "border-dashed border-slate-200 bg-slate-50/80 opacity-70",
            )}
          >
            <div className="flex items-start gap-2.5">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  doc.available
                    ? "bg-red-50 text-red-500"
                    : "bg-slate-100 text-slate-400",
                )}
              >
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800">
                  {doc.available ? doc.name : doc.name.replace(".pdf", "")}
                </p>
                {doc.available ? (
                  <div className="mt-1.5 flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-[10px] font-medium text-[#1B6EF3] hover:bg-blue-50 hover:text-[#1558C8]"
                      onClick={() => onDownload(doc.id)}
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-[10px] font-medium text-slate-500 hover:bg-slate-100"
                      onClick={() => onPreview(doc.id)}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Preview
                    </Button>
                  </div>
                ) : (
                  <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Pending
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
