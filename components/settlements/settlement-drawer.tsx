"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ExternalLink,
  FileText,
  Printer,
  Receipt,
  Share2,
  X,
} from "lucide-react";
import { useEffect } from "react";

import { SettlementAuditCard } from "@/components/settlements/settlement-audit-card";
import { SettlementTimeline } from "@/components/settlements/settlement-timeline";
import { StatusBadge } from "@/components/settlements/status-badge";
import { TransferConfirmationCard } from "@/components/settlements/transfer-confirmation-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Settlement, SettlementAudit } from "@/types/settlements";

interface SettlementDrawerProps {
  open: boolean;
  settlement: Settlement | null;
  audit: SettlementAudit | null;
  isLoading?: boolean;
  onClose: () => void;
  onDownloadInvoice: () => void;
  onDownloadReceipt: () => void;
  onViewSettlement: () => void;
  onSharePdf: () => void;
  onPrintReceipt: () => void;
  className?: string;
}

function DrawerSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  );
}

export function SettlementDrawer({
  open,
  settlement,
  audit,
  isLoading,
  onClose,
  onDownloadInvoice,
  onDownloadReceipt,
  onViewSettlement,
  onSharePdf,
  onPrintReceipt,
  className,
}: SettlementDrawerProps) {
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

  return (
    <AnimatePresence>
      {open ? (
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
              "fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl",
              className,
            )}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <div className="shrink-0 border-b border-slate-100 bg-white px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Settlement Detail
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">
                    {settlement?.settlementId ?? "—"} Breakdown
                  </h2>
                  {settlement ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge status={settlement.status} />
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Close details"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {isLoading || !settlement ? (
                <DrawerSkeleton />
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-sm">
                    <div>
                      <p className="text-[10px] uppercase text-slate-400">
                        Order ID
                      </p>
                      <p className="font-medium text-slate-800">
                        {settlement.orderRef}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400">
                        Invoice ID
                      </p>
                      <p className="font-medium text-slate-800">
                        {settlement.invoiceId}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] uppercase text-slate-400">
                        Buyer Company
                      </p>
                      <p className="font-medium text-slate-800">
                        {settlement.buyerCompany}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400">
                        Material
                      </p>
                      <p className="font-medium text-slate-800">
                        {settlement.material}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400">
                        Warehouse
                      </p>
                      <p className="font-medium text-slate-800">
                        {settlement.warehouse}
                      </p>
                    </div>
                  </div>

                  <SettlementTimeline steps={settlement.timeline} />

                  {audit ? <SettlementAuditCard audit={audit} /> : null}

                  <TransferConfirmationCard
                    payment={settlement.paymentDetails}
                  />
                </div>
              )}
            </div>

            {settlement && !isLoading ? (
              <div className="shrink-0 space-y-3 border-t border-slate-100 p-5">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={onDownloadInvoice}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Invoice
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-[#0B1F3A] hover:bg-[#16345A]"
                    onClick={onDownloadReceipt}
                  >
                    <Receipt className="h-3.5 w-3.5" />
                    Receipt
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={onViewSettlement}
                  >
                    <ExternalLink className="h-3 w-3" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={onSharePdf}
                  >
                    <Share2 className="h-3 w-3" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={onPrintReceipt}
                  >
                    <Printer className="h-3 w-3" />
                    Print
                  </Button>
                </div>
                <p className="text-[10px] leading-relaxed text-slate-400">
                  Settlements are calculated after quality verification and
                  commission deduction. Contact support for disputes.
                </p>
              </div>
            ) : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
