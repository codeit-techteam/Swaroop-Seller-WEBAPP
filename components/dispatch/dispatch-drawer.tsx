"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

import { ChecklistCard } from "@/components/dispatch/checklist-card";
import { DocumentsCard } from "@/components/dispatch/documents-card";
import { TimelineCard } from "@/components/dispatch/timeline-card";
import { TransportCard } from "@/components/dispatch/transport-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DispatchOrder } from "@/types/dispatch";

interface DispatchDrawerProps {
  open: boolean;
  dispatch: DispatchOrder | null;
  onClose: () => void;
  onAssignVehicle: () => void;
  onGenerateEway: () => void;
  onReleaseShipment: () => void;
  onDownloadDocument: (documentId: string) => void;
  onPreviewDocument: (documentId: string) => void;
  className?: string;
}

export function DispatchDrawer({
  open,
  dispatch,
  onClose,
  onAssignVehicle,
  onGenerateEway,
  onReleaseShipment,
  onDownloadDocument,
  onPreviewDocument,
  className,
}: DispatchDrawerProps) {
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
      {open && dispatch ? (
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
            <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Dispatch Detail
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {dispatch.dispatchId.replace("DSP-", "ORD-")} |{" "}
                  {dispatch.buyerCompany}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase text-slate-400">
                    Material
                  </p>
                  <p className="mt-0.5 font-semibold text-slate-800">
                    {dispatch.material}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase text-slate-400">
                    Warehouse
                  </p>
                  <p className="mt-0.5 font-semibold text-slate-800">
                    {dispatch.warehouseLabel}
                  </p>
                </div>
              </div>

              <ChecklistCard items={dispatch.checklist} />
              <TransportCard transport={dispatch.transport} />
              <DocumentsCard
                documents={dispatch.documents}
                onDownload={onDownloadDocument}
                onPreview={onPreviewDocument}
              />
              <TimelineCard activities={dispatch.activity} />
            </div>

            <div className="shrink-0 space-y-2 border-t border-slate-100 bg-white px-5 py-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-10 border-slate-200"
                  onClick={onGenerateEway}
                >
                  Generate E-Way
                </Button>
                <Button
                  variant="outline"
                  className="h-10 border-slate-200"
                  onClick={onAssignVehicle}
                >
                  Assign Vehicle
                </Button>
              </div>
              <Button
                className="h-11 w-full bg-teal-600 text-sm font-bold uppercase tracking-wide hover:bg-teal-700"
                onClick={onReleaseShipment}
              >
                Release Shipment
              </Button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
