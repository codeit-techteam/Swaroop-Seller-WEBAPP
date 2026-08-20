"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  FileText,
  MapPin,
  Package,
  Warehouse,
  X,
} from "lucide-react";
import { useEffect } from "react";

import { ChecklistCard } from "@/components/dispatch/checklist-card";
import { DocumentsCard } from "@/components/dispatch/documents-card";
import { StatusBadge } from "@/components/dispatch/status-badge";
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
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] lg:bg-transparent lg:pointer-events-none lg:backdrop-blur-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className={cn(
              "fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10",
              className,
            )}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
          >
            <div className="relative shrink-0 overflow-hidden border-b border-slate-100 bg-gradient-to-br from-[#F5F9FF] via-white to-teal-50/40 px-5 pb-4 pt-5">
              <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#1B6EF3]/10 blur-2xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">
                      Dispatch Detail
                    </h2>
                    <StatusBadge
                      status={dispatch.status}
                      isDelayed={dispatch.isDelayed}
                    />
                  </div>
                  <p className="mt-1.5 font-mono text-sm font-semibold text-slate-700">
                    {dispatch.dispatchId.replace("DSP-", "ORD-")}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-slate-500">
                    {dispatch.buyerCompany}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-700"
                  aria-label="Close details"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <div className="grid grid-cols-2 gap-2.5">
                <InfoChip
                  icon={Package}
                  label="Material"
                  value={dispatch.material}
                />
                <InfoChip
                  icon={Warehouse}
                  label="Warehouse"
                  value={dispatch.warehouseLabel}
                />
                <InfoChip
                  icon={FileText}
                  label="Quantity"
                  value={`${dispatch.quantityMt.toFixed(1)} MT`}
                />
                <InfoChip
                  icon={MapPin}
                  label="Destination"
                  value={dispatch.destination}
                />
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

            <div className="shrink-0 space-y-2.5 border-t border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-slate-200 font-medium hover:bg-slate-50"
                  onClick={onGenerateEway}
                >
                  Generate E-Way
                </Button>
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-slate-200 font-medium hover:bg-slate-50"
                  onClick={onAssignVehicle}
                >
                  Assign Vehicle
                </Button>
              </div>
              <Button
                className="h-11 w-full rounded-xl bg-teal-600 text-sm font-bold tracking-wide shadow-md shadow-teal-600/25 transition-all hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/30"
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

function InfoChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/90 px-3 py-2.5 transition-colors hover:bg-slate-50">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Icon className="h-3 w-3" />
        <p className="text-[10px] font-semibold uppercase tracking-wide">
          {label}
        </p>
      </div>
      <p
        className="mt-1 truncate text-sm font-semibold text-slate-800"
        title={value}
      >
        {value}
      </p>
    </div>
  );
}
