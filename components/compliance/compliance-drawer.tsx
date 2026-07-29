"use client";

import { format, parseISO } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Upload, X } from "lucide-react";
import { useEffect } from "react";

import { AdminRemarksCard } from "@/components/compliance/admin-remarks-card";
import { DocumentPreview } from "@/components/compliance/document-preview";
import { ComplianceDrawerSkeleton } from "@/components/compliance/loading-skeleton";
import { StatusBadge } from "@/components/compliance/status-badge";
import { VerificationTimeline } from "@/components/compliance/verification-timeline";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComplianceDocument } from "@/types/compliance";

interface ComplianceDrawerProps {
  open: boolean;
  document: ComplianceDocument | null;
  loading?: boolean;
  variant?: "overlay" | "inline";
  onClose: () => void;
  onUpload: () => void;
  onDownload: () => void;
  onFastTrack: () => void;
  className?: string;
}

function formatDate(value: string | null) {
  if (!value) return "N/A";
  return format(parseISO(value), "MMM d, yyyy");
}

export function ComplianceDrawer({
  open,
  document,
  loading = false,
  variant = "overlay",
  onClose,
  onUpload,
  onDownload,
  onFastTrack,
  className,
}: ComplianceDrawerProps) {
  const isInline = variant === "inline";

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.document.addEventListener("keydown", onKeyDown);
    if (!isInline) {
      window.document.body.style.overflow = "hidden";
    }
    return () => {
      window.document.removeEventListener("keydown", onKeyDown);
      if (!isInline) {
        window.document.body.style.overflow = "";
      }
    };
  }, [onClose, open, isInline]);

  const panel = (
    <motion.aside
      className={cn(
        "flex h-full flex-col border-slate-200 bg-white",
        isInline
          ? "sticky top-0 w-full shrink-0 self-start border-l shadow-none xl:w-[380px] 2xl:w-[420px]"
          : "fixed inset-y-0 right-0 z-50 w-full max-w-md border-l shadow-2xl",
        className,
      )}
      initial={isInline ? { opacity: 0, x: 24 } : { x: "100%" }}
      animate={isInline ? { opacity: 1, x: 0 } : { x: 0 }}
      exit={isInline ? { opacity: 0, x: 24 } : { x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Document Details
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close details"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {loading || !document ? (
        <ComplianceDrawerSkeleton />
      ) : (
        <>
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {document.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Lic. No: {document.documentNumber}
                  </p>
                </div>
                <StatusBadge status={document.status} />
              </div>
            </div>

            <DocumentPreview document={document} />

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase text-slate-400">
                  Issue Date
                </p>
                <p className="mt-0.5 font-semibold text-slate-800">
                  {formatDate(document.issueDate)}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase text-slate-400">
                  Expiry Date
                </p>
                <p
                  className={cn(
                    "mt-0.5 font-semibold",
                    document.status === "expired"
                      ? "text-red-600"
                      : document.status === "expiring_soon"
                        ? "text-orange-600"
                        : "text-slate-800",
                  )}
                >
                  {formatDate(document.expiryDate)}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase text-slate-400">
                  Uploaded By
                </p>
                <p className="mt-0.5 font-semibold text-slate-800">
                  {document.uploadedBy}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase text-slate-400">
                  Uploaded Date
                </p>
                <p className="mt-0.5 font-semibold text-slate-800">
                  {formatDate(document.uploadedAt)}
                </p>
              </div>
            </div>

            <VerificationTimeline steps={document.timeline} />
            <AdminRemarksCard remark={document.adminRemark} />
          </div>

          <div className="shrink-0 space-y-2 border-t border-slate-100 bg-white px-5 py-4">
            <Button
              className="h-11 w-full gap-2 bg-[#0B1F3A] text-sm font-semibold hover:bg-[#122846]"
              onClick={onUpload}
            >
              <Upload className="h-4 w-4" />
              Upload New Version
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full gap-2 border-slate-300"
              onClick={onDownload}
            >
              <Download className="h-4 w-4" />
              Download Current
            </Button>
            <button
              type="button"
              onClick={onFastTrack}
              className="w-full py-2 text-center text-sm font-medium text-[#1B6EF3] hover:underline"
            >
              Request Fast-Track Verification
            </button>
          </div>
        </>
      )}
    </motion.aside>
  );

  if (isInline) {
    return (
      <AnimatePresence mode="wait">
        {open && document ? panel : null}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {open && document ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/30 lg:bg-transparent lg:pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {panel}
        </>
      ) : null}
    </AnimatePresence>
  );
}
