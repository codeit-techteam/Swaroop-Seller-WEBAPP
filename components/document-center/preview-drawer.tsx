"use client";

import { Download, FileText, History, RefreshCw, Replace } from "lucide-react";

import { ActionDrawer } from "@/components/erp/action-drawer";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { SellerDocument } from "@/types/documents";
import { DOCUMENT_STATUS_LABELS } from "@/types/documents";

interface PreviewDrawerProps {
  open: boolean;
  document: SellerDocument | null;
  onClose: () => void;
  onDownload: () => void;
  onReplace: () => void;
  onRenew: () => void;
  onHistory: () => void;
}

export function PreviewDrawer({
  open,
  document,
  onClose,
  onDownload,
  onReplace,
  onRenew,
  onHistory,
}: PreviewDrawerProps) {
  if (!document) return null;

  const isImage =
    document.previewMimeType === "image/png" ||
    document.previewMimeType === "image/jpeg";

  return (
    <ActionDrawer
      open={open}
      onClose={onClose}
      title={document.name}
      widthClassName="w-full max-w-lg"
      footer={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex-1" onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          {document.status === "expiring" || document.status === "expired" ? (
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={onRenew}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Renew
            </Button>
          ) : (
            <Button
              className="flex-1 bg-[#0B1F3A] hover:bg-[#122846]"
              onClick={onReplace}
            >
              <Replace className="mr-2 h-4 w-4" />
              Replace
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-5">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {isImage || document.previewMimeType === "application/pdf" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={document.previewUrl}
              alt={document.name}
              className="h-56 w-full object-cover object-top"
            />
          ) : (
            <div className="flex h-56 flex-col items-center justify-center gap-2 text-slate-500">
              <FileText className="h-12 w-12" />
              <p className="text-sm font-medium">{document.fileName}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Status
            </p>
            <p className="mt-1 font-medium text-slate-800">
              {DOCUMENT_STATUS_LABELS[document.status]}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Version
            </p>
            <p className="mt-1 font-medium text-slate-800">
              {document.version}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Reference
            </p>
            <p className="mt-1 font-medium text-slate-800">
              {document.reference}
            </p>
          </div>
          {document.expiryDate ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Expiry
              </p>
              <p className="mt-1 font-medium text-slate-800">
                {formatDate(document.expiryDate)}
              </p>
            </div>
          ) : null}
          {document.verifiedBy ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Verified By
              </p>
              <p className="mt-1 font-medium text-slate-800">
                {document.verifiedBy}
              </p>
            </div>
          ) : null}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              File
            </p>
            <p className="mt-1 font-medium text-slate-800">
              {document.fileName} · {document.fileSizeLabel}
            </p>
          </div>
        </div>

        {document.remarks ? (
          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Remarks
            </p>
            <p className="mt-1">{document.remarks}</p>
          </div>
        ) : null}

        <Button variant="outline" className="w-full" onClick={onHistory}>
          <History className="mr-2 h-4 w-4" />
          Version History
        </Button>
      </div>
    </ActionDrawer>
  );
}
