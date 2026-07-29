"use client";

import { motion } from "framer-motion";

import { AnimatedNumber } from "@/components/erp/animated-number";
import { cn } from "@/lib/utils";
import type {
  OfferReviewSummary,
  OfferReviewSummaryKey,
} from "@/types/offer-review";

const cards: {
  key: OfferReviewSummaryKey;
  label: string;
  valueClass?: string;
}[] = [
  { key: "totalSubmitted", label: "Total Submitted" },
  { key: "pendingReview", label: "Pending Review" },
  { key: "approved", label: "Approved", valueClass: "text-emerald-600" },
  { key: "needsChanges", label: "Needs Changes", valueClass: "text-red-600" },
  { key: "rejected", label: "Rejected" },
];

interface OfferReviewSummaryCardsProps {
  summary: OfferReviewSummary;
  onCardClick?: (key: OfferReviewSummaryKey) => void;
  className?: string;
}

export function OfferReviewSummaryCards({
  summary,
  onCardClick,
  className,
}: OfferReviewSummaryCardsProps) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
        className,
      )}
    >
      {cards.map((card, index) => {
        const value = summary[card.key];
        return (
          <motion.button
            key={card.key}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
            whileHover={{ y: -2 }}
            onClick={() => onCardClick?.(card.key)}
            className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {card.label}
            </p>
            <p
              className={cn(
                "mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900",
                card.valueClass,
              )}
            >
              <AnimatedNumber value={value} decimals={0} />
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
