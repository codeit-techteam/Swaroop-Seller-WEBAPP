"use client";

import { motion } from "framer-motion";
import { ArrowDownUp, ClipboardList } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { OfferReviewRow } from "@/components/offer-review/offer-review-row";
import { OfferReviewPagination } from "@/components/offer-review/pagination";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { OfferReview, OfferReviewSort } from "@/types/offer-review";

interface OfferReviewTableProps {
  offers: OfferReview[];
  selectedId: string | null;
  sort: OfferReviewSort;
  page: number;
  pageSize: number;
  totalItems: number;
  hasFilters: boolean;
  onSort: (key: OfferReviewSort["key"]) => void;
  onPageChange: (page: number) => void;
  onView: (offer: OfferReview) => void;
  onEdit: (offer: OfferReview) => void;
  onDuplicate: (offer: OfferReview) => void;
  onWithdraw: (offer: OfferReview) => void;
  onHistory: (offer: OfferReview) => void;
  className?: string;
}

const columns: {
  key: OfferReviewSort["key"];
  label: string;
}[] = [
  { key: "offerId", label: "Offer ID" },
  { key: "productGrade", label: "Product Grade" },
  { key: "warehouse", label: "Warehouse" },
  { key: "quantityMt", label: "Quantity (MT)" },
  { key: "basePrice", label: "Base Price" },
  { key: "submittedAt", label: "Submitted" },
  { key: "status", label: "Status" },
];

export function OfferReviewTable({
  offers,
  selectedId,
  sort,
  page,
  pageSize,
  totalItems,
  hasFilters,
  onSort,
  onPageChange,
  onView,
  onEdit,
  onDuplicate,
  onWithdraw,
  onHistory,
  className,
}: OfferReviewTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      {offers.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={ClipboardList}
            title={hasFilters ? "No Search Results" : "No Offers Submitted"}
            description={
              hasFilters
                ? "No offers match your current search or filters. Try adjusting your criteria."
                : "You have not submitted any marketplace offers for review yet."
            }
          />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white">
                <TableRow className="hover:bg-transparent">
                  {columns.map((column) => (
                    <TableHead key={column.key}>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-800"
                        onClick={() => onSort(column.key)}
                      >
                        {column.label}
                        <ArrowDownUp
                          className={cn(
                            "h-3 w-3",
                            sort.key === column.key
                              ? "text-[#1B6EF3]"
                              : "text-slate-300",
                          )}
                        />
                      </button>
                    </TableHead>
                  ))}
                  <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => (
                  <OfferReviewRow
                    key={offer.id}
                    offer={offer}
                    active={selectedId === offer.id}
                    onView={() => onView(offer)}
                    onEdit={() => onEdit(offer)}
                    onDuplicate={() => onDuplicate(offer)}
                    onWithdraw={() => onWithdraw(offer)}
                    onHistory={() => onHistory(offer)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
          <OfferReviewPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={onPageChange}
          />
        </>
      )}
    </motion.div>
  );
}
