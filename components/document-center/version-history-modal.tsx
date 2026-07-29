"use client";

import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { SellerDocument } from "@/types/documents";

interface VersionHistoryModalProps {
  open: boolean;
  document: SellerDocument | null;
  onClose: () => void;
}

export function VersionHistoryModal({
  open,
  document,
  onClose,
}: VersionHistoryModalProps) {
  if (!document) return null;

  const versions = document.versionHistory;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500">{document.name}</p>

        <div className="mt-4 space-y-0">
          {versions.map((version, index) => (
            <motion.div
              key={version.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "relative flex items-center gap-3 border-l-2 py-2.5 pl-4",
                version.isLatest
                  ? "border-[#1B6EF3] bg-[#F5F9FF]/60"
                  : "border-slate-200",
              )}
            >
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    version.isLatest ? "text-[#1B6EF3]" : "text-slate-700",
                  )}
                >
                  {version.version}: {version.label}
                </p>
                <p className="text-[11px] text-slate-400">
                  {format(parseISO(version.timestamp), "MMM d, yyyy · HH:mm")}
                </p>
                <p className="text-[11px] text-slate-400">{version.fileName}</p>
              </div>
              {version.isLatest ? (
                <span className="shrink-0 rounded-full bg-[#1B6EF3] px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                  Latest
                </span>
              ) : null}
            </motion.div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
