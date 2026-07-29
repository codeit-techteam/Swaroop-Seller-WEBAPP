"use client";

import { format, parseISO } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

import { AuditTimeline } from "@/components/price-revision/audit-timeline";
import { CounterOfferForm } from "@/components/price-revision/counter-offer-form";
import {
  DrawerSkeleton,
  TimelineSkeleton,
} from "@/components/price-revision/loading-skeleton";
import { MarketRecommendationCard } from "@/components/price-revision/market-recommendation-card";
import { OfferDetailsCard } from "@/components/price-revision/offer-details-card";
import { StatusBadge } from "@/components/price-revision/status-badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type {
  CounterOfferDraft,
  PriceRevisionRequest,
} from "@/types/price-revision";

interface PriceRevisionDrawerProps {
  open: boolean;
  request: PriceRevisionRequest | null;
  counterForm: CounterOfferDraft;
  isLoading?: boolean;
  onClose: () => void;
  onCounterFormChange: (data: Partial<CounterOfferDraft>) => void;
  onAccept: () => void;
  onSubmitCounter: (data: {
    counterPrice: string;
    moq: string;
    validity: string;
    remarks?: string;
  }) => void;
  onSaveDraft: () => void;
  onReject: () => void;
  className?: string;
}

function formatPrice(value: number): string {
  return formatCurrency(value, { currency: "INR" }).replace(/\.00$/, "");
}

export function PriceRevisionDrawer({
  open,
  request,
  counterForm,
  isLoading,
  onClose,
  onCounterFormChange,
  onAccept,
  onSubmitCounter,
  onSaveDraft,
  onReject,
  className,
}: PriceRevisionDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, open]);

  const canAct =
    request?.status === "pending_response" || request?.status === "countered";
  const isPending = request?.status === "pending_response";

  return (
    <AnimatePresence>
      {open && request ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/40"
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
            <div className="shrink-0 border-b border-slate-100 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Review Price Revision
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">
                    #{request.requestId}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Received on{" "}
                    {format(
                      parseISO(request.receivedAt),
                      "MMM d, yyyy · h:mm a",
                    )}
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={request.status} animated />
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
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              {isLoading ? (
                <>
                  <TimelineSkeleton />
                  <DrawerSkeleton />
                </>
              ) : (
                <>
                  <OfferDetailsCard request={request} />
                  <MarketRecommendationCard
                    recommendation={request.marketRecommendation}
                  />
                  {canAct ? (
                    <CounterOfferForm
                      formData={counterForm}
                      disabled={!isPending}
                      onChange={onCounterFormChange}
                      onSubmit={onSubmitCounter}
                      onSaveDraft={onSaveDraft}
                    />
                  ) : request.counterOffer ? (
                    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600">
                        Submitted Counter Offer
                      </p>
                      <p className="mt-2 font-semibold text-slate-800">
                        {formatPrice(request.counterOffer.counterPrice)}/MT
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        MOQ {request.counterOffer.moq} MT · Validity{" "}
                        {request.counterOffer.validity}
                      </p>
                      {request.counterOffer.remarks ? (
                        <p className="mt-2 text-xs text-slate-600">
                          {request.counterOffer.remarks}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  <AuditTimeline steps={request.timeline} />
                </>
              )}
            </div>

            {canAct && !isLoading ? (
              <div className="shrink-0 space-y-2 border-t border-slate-100 bg-white px-5 py-4">
                {isPending ? (
                  <>
                    <Button
                      className="h-11 w-full bg-[#1B6EF3] text-sm font-bold uppercase hover:bg-[#1558C8]"
                      onClick={onAccept}
                    >
                      Accept Suggested Price (
                      {formatPrice(request.suggestedPrice)}
                      /MT)
                    </Button>
                    <p className="text-center text-[10px] text-slate-400">
                      Platform recommendation — seller cannot edit live pricing
                      directly
                    </p>
                  </>
                ) : (
                  <p className="text-center text-xs text-slate-500">
                    Counter offer under admin review. Awaiting PetroTrade
                    decision.
                  </p>
                )}
                {isPending ? (
                  <button
                    type="button"
                    onClick={onReject}
                    className="w-full py-2 text-center text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
                  >
                    Reject Revision Request
                  </button>
                ) : null}
              </div>
            ) : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
