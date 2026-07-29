"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProfileDocument } from "@/types/profile";

interface AlertBannerProps {
  document: ProfileDocument | null;
  onUpdateNow: () => void;
  className?: string;
}

export function AlertBanner({
  document,
  onUpdateNow,
  className,
}: AlertBannerProps) {
  return (
    <AnimatePresence>
      {document ? (
        <motion.div
          key={document.id}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 md:px-5",
            className,
          )}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-orange-900">
                  Document Expiry Alert
                </p>
                <p className="text-sm leading-relaxed text-orange-800/90">
                  Your <span className="font-semibold">{document.title}</span>{" "}
                  (Udyam Registration) is scheduled to expire in{" "}
                  <span className="font-semibold">
                    {document.daysUntilExpiry ?? 12} days
                  </span>
                  . Please upload the renewed document to avoid operational
                  disruptions in your payout processing.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 self-start font-bold uppercase tracking-wide text-orange-700 hover:bg-orange-100 hover:text-orange-800"
              onClick={onUpdateNow}
            >
              Update Now
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
