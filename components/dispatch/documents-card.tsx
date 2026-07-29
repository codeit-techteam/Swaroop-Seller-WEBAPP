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
      <div className="grid grid-cols-2 gap-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={cn(
              "rounded-lg border px-3 py-2.5",
              doc.available
                ? "border-slate-200 bg-white"
                : "border-dashed border-slate-200 bg-slate-50 opacity-60",
            )}
          >
            <div className="flex items-start gap-2">
              <FileText
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  doc.available ? "text-red-500" : "text-slate-400",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800">
                  {doc.available ? doc.name : doc.name.replace(".pdf", "")}
                </p>
                {doc.available ? (
                  <div className="mt-1.5 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-[10px] text-[#1B6EF3]"
                      onClick={() => onDownload(doc.id)}
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-[10px] text-slate-500"
                      onClick={() => onPreview(doc.id)}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Preview
                    </Button>
                  </div>
                ) : (
                  <p className="mt-1 text-[10px] text-slate-400">Pending</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
