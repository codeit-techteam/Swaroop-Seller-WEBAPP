"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  Archive,
  Clock,
  Download,
  Eye,
  FileText,
  History,
  Replace,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { DocumentCategory, SellerDocument } from "@/types/documents";

interface DocumentCardProps {
  document: SellerDocument;
  variant?: DocumentCategory;
  index?: number;
  onPreview: (doc: SellerDocument) => void;
  onDownload: (doc: SellerDocument) => void;
  onReplace: (doc: SellerDocument) => void;
  onRenew: (doc: SellerDocument) => void;
  onHistory: (doc: SellerDocument) => void;
  onArchive: (doc: SellerDocument) => void;
  onDelete: (doc: SellerDocument) => void;
}

function StatusBadge({ document }: { document: SellerDocument }) {
  const config = {
    verified: {
      label: "Verified",
      className: "text-emerald-600",
      icon: null,
    },
    pending: {
      label: "Pending",
      className: "text-slate-500",
      icon: Clock,
    },
    expiring: {
      label: "Expiring",
      className: "text-red-600",
      icon: AlertCircle,
    },
    expired: {
      label: "Expired",
      className: "text-red-600",
      icon: AlertCircle,
    },
    archived: {
      label: "Archived",
      className: "text-slate-400",
      icon: Archive,
    },
  }[document.status];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold",
        config.className,
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {config.label}
    </span>
  );
}

function borderColor(document: SellerDocument) {
  if (document.status === "verified") return "border-l-[#1B6EF3]";
  if (document.status === "expiring" || document.status === "expired")
    return "border-l-red-500";
  if (document.status === "pending") return "border-l-slate-300";
  return "border-l-slate-200";
}

export function DocumentCard({
  document,
  variant = document.category,
  index = 0,
  onPreview,
  onDownload,
  onReplace,
  onRenew,
  onHistory,
  onArchive,
  onDelete,
}: DocumentCardProps) {
  const isList = variant === "logistics" || variant === "marketplace";
  const isWide = variant === "technical_quality";

  if (isList) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-shadow hover:shadow-sm"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <FileText className="h-4 w-4 text-slate-500" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">
              {document.name}
            </p>
            <StatusBadge document={document} />
          </div>
          <div className="mt-1 space-y-0.5 text-[11px] text-slate-500">
            {document.metadata?.batch ? (
              <p>Batch: {document.metadata.batch}</p>
            ) : null}
            {document.metadata?.date ? (
              <p>Date: {formatDate(document.metadata.date)}</p>
            ) : null}
            {document.metadata?.transporter ? (
              <p>Transporter: {document.metadata.transporter}</p>
            ) : null}
            {document.metadata?.source ? (
              <p>Source: {document.metadata.source}</p>
            ) : null}
            {document.metadata?.cycle ? (
              <p>Cycle: {document.metadata.cycle}</p>
            ) : null}
            <p>Ref: {document.reference}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500"
            onClick={() => onPreview(document)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500"
            onClick={() => onDownload(document)}
          >
            <Download className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500"
              >
                <History className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onHistory(document)}>
                Version History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onReplace(document)}>
                Replace
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive(document)}>
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDelete(document)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    );
  }

  if (isWide) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className={cn(
          "rounded-xl border border-slate-200 border-l-4 bg-white p-4 shadow-sm",
          borderColor(document),
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F1FF]">
            <FileText className="h-5 w-5 text-[#1B6EF3]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-base font-bold text-slate-900">
                {document.name}
              </h3>
              <StatusBadge document={document} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              {document.verifiedAt ? (
                <span>Verified: {formatDate(document.verifiedAt)}</span>
              ) : null}
              <span>Version: {document.version}</span>
              {document.expiryDate ? (
                <span>Expiry: {formatDate(document.expiryDate)}</span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="border-[#1B6EF3] text-[#1B6EF3] hover:bg-[#E8F1FF]"
            onClick={() => onDownload(document)}
          >
            <Download className="mr-2 h-4 w-4" />
            DOWNLOAD
          </Button>
          <Button
            className="bg-[#0B1F3A] hover:bg-[#122846]"
            onClick={() => onPreview(document)}
          >
            <Eye className="mr-2 h-4 w-4" />
            PREVIEW
          </Button>
        </div>
        <div className="mt-2 flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onHistory(document)}
          >
            <History className="mr-1 h-3 w-3" />
            History
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onReplace(document)}
          >
            <Replace className="mr-1 h-3 w-3" />
            Replace
          </Button>
        </div>
      </motion.div>
    );
  }

  // Business & Statutory - vertical card
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        "relative rounded-xl border border-slate-200 border-l-4 bg-white p-4 shadow-sm",
        borderColor(document),
      )}
    >
      {(document.status === "expiring" || document.status === "pending") && (
        <div className="absolute right-3 top-3">
          {document.status === "expiring" ? (
            <AlertCircle className="h-4 w-4 text-red-500" />
          ) : (
            <Clock className="h-4 w-4 text-slate-400" />
          )}
        </div>
      )}

      <h3 className="text-lg font-bold text-slate-900">{document.name}</h3>
      <div className="mt-1">
        <StatusBadge document={document} />
      </div>

      <div className="mt-4 space-y-2 text-xs text-slate-500">
        <div className="flex justify-between">
          <span>Version</span>
          <span className="font-medium text-slate-700">
            {document.version}
            {document.status === "verified" ? " Active" : ""}
          </span>
        </div>
        {document.expiryDate ? (
          <div className="flex justify-between">
            <span>Expiry</span>
            <span
              className={cn(
                "font-medium",
                document.status === "expiring" || document.status === "expired"
                  ? "text-red-600"
                  : "text-slate-700",
              )}
            >
              {formatDate(document.expiryDate)}
            </span>
          </div>
        ) : document.status === "pending" ? (
          <div className="flex justify-between">
            <span>Upload Date</span>
            <span className="font-medium text-slate-700">
              {formatDate(document.uploadDate)}
            </span>
          </div>
        ) : null}
        {document.verifiedBy ? (
          <div className="flex justify-between">
            <span>Verified By</span>
            <span className="font-medium text-slate-700">
              {document.verifiedBy}
            </span>
          </div>
        ) : document.status === "pending" ? (
          <div className="flex justify-between">
            <span>Status</span>
            <span className="font-medium text-slate-700">In-Review</span>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500"
            onClick={() => onPreview(document)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500"
            onClick={() => onDownload(document)}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              document.status === "pending"
                ? "text-slate-300"
                : "text-slate-500",
            )}
            disabled={document.status === "pending"}
            onClick={() => onHistory(document)}
          >
            <History className="h-4 w-4" />
          </Button>
        </div>

        {document.status === "verified" ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[10px] font-bold uppercase tracking-wide"
            onClick={() => onReplace(document)}
          >
            REPLACE
          </Button>
        ) : document.status === "expiring" || document.status === "expired" ? (
          <Button
            size="sm"
            className="h-7 bg-red-600 text-[10px] font-bold uppercase tracking-wide hover:bg-red-700"
            onClick={() => onRenew(document)}
          >
            RENEW NOW
          </Button>
        ) : document.status === "pending" ? (
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            AWAITING VERIFICATION
          </span>
        ) : null}
      </div>

      <div className="mt-1 flex justify-end gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] text-slate-400"
            >
              More
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onArchive(document)}>
              <Archive className="mr-2 h-3.5 w-3.5" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(document)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
