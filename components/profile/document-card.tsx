"use client";

import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Eye, FileText, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProfileDocument, ProfileDocumentStatus } from "@/types/profile";

interface DocumentCardProps {
  document: ProfileDocument;
  index?: number;
  onPreview: (documentId: string) => void;
  onUpload?: () => void;
  className?: string;
}

interface DocumentAddCardProps {
  label: string;
  onAdd: () => void;
  className?: string;
}

const STATUS_STYLES: Record<
  ProfileDocumentStatus,
  { badge: string; label: string }
> = {
  active: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    label: "Active",
  },
  expiring_soon: {
    badge: "bg-orange-50 text-orange-700 ring-orange-200",
    label: "Expiring Soon",
  },
  expired: {
    badge: "bg-red-50 text-red-700 ring-red-200",
    label: "Expired",
  },
  pending: {
    badge: "bg-sky-50 text-sky-700 ring-sky-200",
    label: "Pending",
  },
};

export function DocumentCard({
  document,
  index = 0,
  onPreview,
  className,
}: DocumentCardProps) {
  const statusStyle = STATUS_STYLES[document.status];
  const isExpiring = document.status === "expiring_soon";

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)" }}
      onClick={() => onPreview(document.id)}
      className={cn(
        "group flex w-full flex-col rounded-xl border border-slate-200 bg-white p-3 text-left transition-colors hover:border-[#1B6EF3]/30",
        className,
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4F8FF] text-[#1B6EF3]">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800">
              {document.title}
            </p>
            <p className="truncate text-[10px] text-slate-400">
              {document.fileName}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ring-1",
            statusStyle.badge,
          )}
        >
          {statusStyle.label}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between pt-2">
        <p
          className={cn(
            "text-[10px] font-medium",
            isExpiring ? "text-orange-600" : "text-slate-500",
          )}
        >
          Exp: {format(parseISO(document.expiryDate), "dd MMM yyyy")}
        </p>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#1B6EF3] opacity-0 transition-opacity group-hover:opacity-100">
          <Eye className="h-3 w-3" />
          Preview
        </span>
      </div>
    </motion.button>
  );
}

export function DocumentAddCard({
  label,
  onAdd,
  className,
}: DocumentAddCardProps) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      whileHover={{ scale: 1.01 }}
      onClick={onAdd}
      className={cn(
        "flex min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 text-center transition-colors hover:border-[#1B6EF3]/40 hover:bg-[#F4F8FF]/50",
        className,
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
        <Plus className="h-4 w-4 text-slate-400" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </motion.button>
  );
}

interface DocumentsCenterProps {
  documents: ProfileDocument[];
  onPreview: (documentId: string) => void;
  onUpload: () => void;
  onAddIso: () => void;
  className?: string;
}

export function DocumentsCenter({
  documents,
  onPreview,
  onUpload,
  onAddIso,
  className,
}: DocumentsCenterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.12 }}
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#1B6EF3]" />
          <h3 className="text-sm font-semibold text-slate-900">
            Documents Center
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
          onClick={onUpload}
        >
          <Plus className="h-3.5 w-3.5" />
          Upload New
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
        {documents.map((doc, index) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            index={index}
            onPreview={onPreview}
          />
        ))}
        <DocumentAddCard label="Add ISO Certificate" onAdd={onAddIso} />
      </div>
    </motion.div>
  );
}
