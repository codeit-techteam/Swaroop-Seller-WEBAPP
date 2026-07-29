"use client";

import { format, parseISO } from "date-fns";
import { History } from "lucide-react";

import { StatusBadge } from "@/components/offer-review/status-badge";
import { VersionHistory } from "@/components/offer-review/version-history";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { OfferReview } from "@/types/offer-review";

interface HistoryModalProps {
  open: boolean;
  offer: OfferReview | null;
  onClose: () => void;
}

export function HistoryModal({ open, offer, onClose }: HistoryModalProps) {
  if (!offer) return null;

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-[#1B6EF3]" />
            Offer History — {offer.offerId}
          </DialogTitle>
          <DialogDescription>
            Complete version and status history for this offer submission.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {offer.productGrade} · {offer.warehouse}
              </p>
              <p className="text-xs text-slate-500">
                Submitted {format(parseISO(offer.submittedAt), "MMM d, yyyy")}
              </p>
            </div>
            <StatusBadge status={offer.status} animated={false} />
          </div>

          <VersionHistory versions={offer.versionHistory} />

          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Review Timeline
            </p>
            <ul className="mt-2 space-y-2">
              {offer.timeline.map((step) => (
                <li
                  key={step.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-medium text-slate-700">
                    {step.title}
                  </span>
                  {step.timestamp ? (
                    <span className="text-xs text-slate-400">
                      {format(parseISO(step.timestamp), "MMM d, yyyy")}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
