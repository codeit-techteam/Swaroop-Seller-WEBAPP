"use client";

import { motion } from "framer-motion";
import { FileText, ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ComplianceDocument } from "@/types/compliance";

interface DocumentPreviewProps {
  document: ComplianceDocument;
  className?: string;
  compact?: boolean;
}

export function DocumentPreview({
  document,
  className,
  compact = false,
}: DocumentPreviewProps) {
  const isImage =
    document.previewMimeType === "image/png" ||
    document.previewMimeType === "image/jpeg";
  const isPdf = document.previewMimeType === "application/pdf";

  return (
    <div className={cn("space-y-2", className)}>
      {!compact ? (
        <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Document Preview
        </h4>
      ) : null}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "overflow-hidden rounded-xl border border-slate-200 bg-slate-50",
          compact ? "h-48" : "h-56",
        )}
      >
        {isImage || isPdf ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={document.previewUrl}
            alt={`${document.name} preview`}
            className="h-full w-full object-cover object-top grayscale-[20%]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
            <FileText className="h-10 w-10" />
            <p className="text-sm font-medium">{document.fileName}</p>
            <p className="text-xs">{document.fileSizeLabel} · DOCX</p>
          </div>
        )}
      </motion.div>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        {isImage ? (
          <ImageIcon className="h-3.5 w-3.5" />
        ) : (
          <FileText className="h-3.5 w-3.5" />
        )}
        <span className="truncate">
          {document.fileName} · {document.fileSizeLabel} · v{document.version}
        </span>
      </div>
    </div>
  );
}
