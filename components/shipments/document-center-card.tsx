"use client";

import { Download, Eye, FileText, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ShipmentDocument } from "@/types/shipments";

const statusLabels: Record<ShipmentDocument["status"], string> = {
  available: "Available",
  pending: "Pending",
  uploaded: "Uploaded",
  missing: "Upload Required",
};

const statusColors: Record<ShipmentDocument["status"], string> = {
  available: "text-emerald-600 bg-emerald-50 border-emerald-100",
  pending: "text-amber-600 bg-amber-50 border-amber-100",
  uploaded: "text-blue-600 bg-blue-50 border-blue-100",
  missing: "text-slate-500 bg-slate-50 border-dashed border-slate-200",
};

interface DocumentCenterCardProps {
  documents: ShipmentDocument[];
  onDownload: (documentId: string) => void;
  onPreview: (documentId: string) => void;
  onUpload?: (documentId: string) => void;
  className?: string;
}

export function DocumentCenterCard({
  documents,
  onDownload,
  onPreview,
  onUpload,
  className,
}: DocumentCenterCardProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Documents
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {documents.map((doc) => {
          const isAvailable =
            doc.status === "available" || doc.status === "uploaded";
          const isMissing = doc.status === "missing";

          return (
            <div
              key={doc.id}
              className={cn(
                "rounded-lg border px-3 py-2.5",
                statusColors[doc.status],
              )}
            >
              <div className="flex items-start gap-2">
                <FileText
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0",
                    isAvailable ? "text-red-500" : "text-slate-400",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-800">
                    {doc.name}
                  </p>
                  <span
                    className={cn(
                      "mt-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase",
                      statusColors[doc.status],
                    )}
                  >
                    {statusLabels[doc.status]}
                  </span>
                  {isAvailable ? (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
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
                  ) : isMissing && onUpload ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1.5 h-6 px-1.5 text-[10px] text-[#1B6EF3]"
                      onClick={() => onUpload(doc.id)}
                    >
                      <Upload className="mr-1 h-3 w-3" />
                      Upload Proof
                    </Button>
                  ) : (
                    <p className="mt-1 text-[10px] text-slate-400">Pending</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
