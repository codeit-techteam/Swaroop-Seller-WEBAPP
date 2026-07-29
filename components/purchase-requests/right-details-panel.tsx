"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

import { DeadlineCard } from "@/components/purchase-requests/deadline-card";
import { DocumentDownloadCard } from "@/components/purchase-requests/document-download-card";
import { MaterialCard } from "@/components/purchase-requests/material-card";
import { NotesCard } from "@/components/purchase-requests/notes-card";
import { WarehouseCard } from "@/components/purchase-requests/warehouse-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PurchaseRequest } from "@/types/purchase-requests";

interface RightDetailsPanelProps {
  open: boolean;
  request: PurchaseRequest | null;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  onCounter: () => void;
  onViewOrder: () => void;
  onHistory: () => void;
  onViewCounter: () => void;
  onDownloadDocument: (documentId: string) => Promise<void>;
  className?: string;
}

export function RightDetailsPanel({
  open,
  request,
  onClose,
  onAccept,
  onReject,
  onCounter,
  onViewOrder,
  onHistory,
  onViewCounter,
  onDownloadDocument,
  className,
}: RightDetailsPanelProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open && request ? (
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
              "fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl",
              className,
            )}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <div className="relative shrink-0 bg-[#0B1F3A] px-5 pb-5 pt-5 text-white">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Close details"
              >
                <X className="h-4 w-4" />
              </button>

              {request.urgency === "urgent" ? (
                <span className="inline-flex rounded-md bg-[#3B82F6]/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#93C5FD]">
                  Urgent Request
                </span>
              ) : (
                <span className="inline-flex rounded-md bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-200">
                  Standard Request
                </span>
              )}

              <p className="mt-3 text-sm font-medium text-blue-200">
                {request.requestNumber}
              </p>
              <h2 className="mt-1 text-xl font-bold leading-tight">
                {request.productName}
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Request from PetroTrade Procurement Team
              </p>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <MaterialCard
                productGrade={request.productGrade}
                mfi={request.mfi}
                quantityMt={request.quantityMt}
                unitPrice={request.unitPrice}
              />

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900">
                  Logistics & Handling
                </h4>
                <WarehouseCard
                  label={request.warehouseLabel}
                  address={request.warehouseAddress}
                />
                <DeadlineCard
                  deadline={request.deadline}
                  timeSlot={request.deadlineTimeSlot}
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900">
                  Verified Documents
                </h4>
                {request.documents.map((document) => (
                  <DocumentDownloadCard
                    key={document.id}
                    document={document}
                    onDownload={() => onDownloadDocument(document.id)}
                  />
                ))}
              </div>

              <NotesCard notes={request.procurementNotes} />

              {request.counterOffer ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-3 text-sm text-blue-900">
                  <p className="font-semibold">Counter Offer Submitted</p>
                  <p className="mt-1 text-xs text-blue-700">
                    Base Price: ${request.counterOffer.basePrice.toFixed(2)} /
                    MT · MOQ: {request.counterOffer.moq} MT · Qty:{" "}
                    {request.counterOffer.availableQuantity} MT
                  </p>
                </div>
              ) : null}

              {request.rejectReason ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-900">
                  <p className="font-semibold">Rejection Reason</p>
                  <p className="mt-1">{request.rejectReason}</p>
                  {request.rejectRemark ? (
                    <p className="mt-1 text-xs text-red-700">
                      {request.rejectRemark}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="shrink-0 space-y-2 border-t border-slate-100 p-5">
              {request.status === "pending" ? (
                <>
                  <Button
                    className="h-11 w-full bg-[#0B1F3A] text-sm font-semibold hover:bg-[#122846]"
                    onClick={onAccept}
                  >
                    Accept Request
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="h-10 border-slate-200"
                      onClick={onReject}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 border-slate-200"
                      onClick={onCounter}
                    >
                      Counter
                    </Button>
                  </div>
                </>
              ) : null}

              {request.status === "accepted" ? (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="h-10 bg-[#0B1F3A] hover:bg-[#122846]"
                    onClick={onViewOrder}
                  >
                    View Order
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 border-slate-200"
                    onClick={onHistory}
                  >
                    History
                  </Button>
                </div>
              ) : null}

              {request.status === "counter_sent" ? (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="h-10 bg-[#0B1F3A] hover:bg-[#122846]"
                    onClick={onViewCounter}
                  >
                    View Counter
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 border-slate-200"
                    onClick={onHistory}
                  >
                    History
                  </Button>
                </div>
              ) : null}

              {request.status === "rejected" ||
              request.status === "expired" ||
              request.status === "closed" ? (
                <Button
                  variant="outline"
                  className="h-10 w-full border-slate-200"
                  onClick={onHistory}
                >
                  History
                </Button>
              ) : null}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
