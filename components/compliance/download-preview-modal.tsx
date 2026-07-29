"use client";

import { format, parseISO } from "date-fns";
import { Download, FileText } from "lucide-react";
import toast from "react-hot-toast";

import { DocumentPreview } from "@/components/compliance/document-preview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ComplianceDocument } from "@/types/compliance";

interface DownloadPreviewModalProps {
  open: boolean;
  document: ComplianceDocument | null;
  onClose: () => void;
}

export function DownloadPreviewModal({
  open,
  document,
  onClose,
}: DownloadPreviewModalProps) {
  if (!document) return null;

  const handleDownload = () => {
    toast.success(`Downloading ${document.fileName} (mock)`);
    // Mock blob download for frontend-only flow
    const blob = new Blob(
      [
        `PetroTrade Compliance Document\n` +
          `Document: ${document.name}\n` +
          `Number: ${document.documentNumber}\n` +
          `Status: ${document.status}\n` +
          `Issued: ${document.issueDate ?? "N/A"}\n` +
          `Expires: ${document.expiryDate ?? "N/A"}\n` +
          `File: ${document.fileName}\n`,
      ],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = document.fileName.replace(/\.[^.]+$/, "") + ".txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Document Preview
          </DialogTitle>
          <DialogDescription>
            Invoice-style preview before download. This is a mock frontend
            download — no backend call is made.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                PetroTrade Compliance
              </p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">
                {document.name}
              </h3>
              <p className="text-sm text-slate-500">
                {document.documentNumber}
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Doc ID: {document.documentId}</p>
              <p>
                Updated: {format(parseISO(document.lastUpdated), "MMM d, yyyy")}
              </p>
            </div>
          </div>

          <DocumentPreview document={document} compact />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-400">
                Verified By
              </p>
              <p className="font-medium text-slate-800">
                {document.verifiedBy ?? "Pending"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-400">
                Version
              </p>
              <p className="font-medium text-slate-800">v{document.version}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            className="gap-2 bg-[#0B1F3A] hover:bg-[#122846]"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Download File
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
