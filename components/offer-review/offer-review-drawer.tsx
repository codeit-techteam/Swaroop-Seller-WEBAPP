"use client";

import { format, parseISO } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, ExternalLink, Pencil, Trash2, X } from "lucide-react";
import Link from "next/link";

import { AdminFeedbackCard } from "@/components/offer-review/admin-feedback-card";
import { DocumentList } from "@/components/offer-review/document-list";
import {
  DrawerSkeleton,
  TimelineSkeleton,
} from "@/components/offer-review/loading-skeleton";
import { RequestedChangesCard } from "@/components/offer-review/requested-changes-card";
import { ReviewTimeline } from "@/components/offer-review/review-timeline";
import { StatusBadge } from "@/components/offer-review/status-badge";
import { VersionHistory } from "@/components/offer-review/version-history";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { OfferReview } from "@/types/offer-review";

interface OfferReviewDrawerProps {
  open: boolean;
  offer: OfferReview | null;
  loading?: boolean;
  onClose: () => void;
  onResubmit: () => void;
  onDuplicate: () => void;
  onWithdraw: () => void;
  onEdit: () => void;
  className?: string;
}

export function OfferReviewDrawer({
  open,
  offer,
  loading = false,
  onClose,
  onResubmit,
  onDuplicate,
  onWithdraw,
  onEdit,
  className,
}: OfferReviewDrawerProps) {
  const canResubmit = offer?.status === "needs_changes";
  const canWithdraw =
    offer?.status === "pending_review" || offer?.status === "needs_changes";

  return (
    <AnimatePresence>
      {open && offer ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/30 lg:bg-transparent lg:pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className={cn(
              "fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl",
              className,
            )}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Offer Review
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  Offer {offer.offerId} Details
                </h2>
                <div className="mt-2">
                  <StatusBadge status={offer.status} />
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              {loading ? (
                <>
                  <TimelineSkeleton />
                  <DrawerSkeleton />
                </>
              ) : (
                <>
                  <ReviewTimeline steps={offer.timeline} />
                  <AdminFeedbackCard feedback={offer.adminFeedback} />
                  <RequestedChangesCard changes={offer.requestedChanges} />
                  <DocumentList documents={offer.documents} />
                  <VersionHistory versions={offer.versionHistory} />
                </>
              )}
            </div>

            <div className="shrink-0 space-y-2 border-t border-slate-100 bg-white px-5 py-4">
              {canResubmit ? (
                <Button
                  className="h-11 w-full gap-2 bg-[#1B6EF3] text-sm font-semibold hover:bg-[#1558C8]"
                  onClick={onResubmit}
                >
                  <Pencil className="h-4 w-4" />
                  Edit Offer &amp; Re-submit
                </Button>
              ) : (
                <Button
                  className="h-11 w-full gap-2 bg-[#0B1F3A] text-sm font-semibold hover:bg-[#122846]"
                  onClick={onEdit}
                >
                  <Pencil className="h-4 w-4" />
                  Edit Offer
                </Button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-10 gap-2 border-slate-300 text-sm"
                  onClick={onDuplicate}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate
                </Button>
                {canWithdraw ? (
                  <Button
                    variant="outline"
                    className="h-10 gap-2 border-red-200 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={onWithdraw}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Withdraw
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="h-10 gap-2 border-slate-300 text-sm"
                    disabled
                  >
                    Withdraw
                  </Button>
                )}
              </div>

              <Link
                href={`${ROUTES.OFFERS_PREVIEW}/${offer.id}`}
                className="flex items-center justify-center gap-1 py-2 text-sm font-medium text-[#1B6EF3] hover:underline"
              >
                View Full Details
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>

              <p className="text-center text-[10px] text-slate-400">
                Submitted {format(parseISO(offer.submittedAt), "MMM d, yyyy")}
              </p>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
