"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, FileText, Upload, X } from "lucide-react";
import { useEffect } from "react";

import { DocumentCenterCard } from "@/components/shipments/document-center-card";
import { ShipmentInfoCard } from "@/components/shipments/shipment-info-card";
import { ShipmentTimeline } from "@/components/shipments/shipment-timeline";
import { VehicleDriverCard } from "@/components/shipments/vehicle-driver-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Shipment } from "@/types/shipments";

interface ShipmentDrawerProps {
  open: boolean;
  shipment: Shipment | null;
  onClose: () => void;
  onGenerateInvoice: () => void;
  onGenerateEway: () => void;
  onUploadPod: () => void;
  onMarkDelivered: () => void;
  onDownloadDocument: (documentId: string) => void;
  onPreviewDocument: (documentId: string) => void;
  className?: string;
}

export function ShipmentDrawer({
  open,
  shipment,
  onClose,
  onGenerateInvoice,
  onGenerateEway,
  onUploadPod,
  onMarkDelivered,
  onDownloadDocument,
  onPreviewDocument,
  className,
}: ShipmentDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  const canMarkDelivered =
    shipment &&
    shipment.status !== "delivered" &&
    shipment.status !== "pending";

  return (
    <AnimatePresence>
      {open && shipment ? (
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
            <div className="shrink-0 bg-[#0B1F3A] px-5 py-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">
                    Shipment Detail
                  </p>
                  <h2 className="mt-1 text-lg font-bold">
                    {shipment.shipmentId}
                  </h2>
                  <p className="mt-0.5 text-sm text-white/70">
                    {shipment.orderId} · {shipment.buyerCompany}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white"
                  aria-label="Close details"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <ShipmentInfoCard shipment={shipment} />
              <VehicleDriverCard vehicleInfo={shipment.vehicleInfo} />
              <DocumentCenterCard
                documents={shipment.documents}
                onDownload={onDownloadDocument}
                onPreview={onPreviewDocument}
                onUpload={() => onUploadPod()}
              />
              <ShipmentTimeline steps={shipment.timeline} />
            </div>

            <div className="shrink-0 space-y-2 border-t border-slate-100 bg-white px-5 py-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 text-xs"
                  onClick={onGenerateInvoice}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Generate Invoice
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 text-xs"
                  onClick={onGenerateEway}
                >
                  <FileText className="h-3.5 w-3.5" />
                  E-Way Bill
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  className="h-9 gap-1.5 bg-[#0B1F3A] text-xs hover:bg-[#16345A]"
                  onClick={onUploadPod}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload POD
                </Button>
                {canMarkDelivered ? (
                  <Button
                    size="sm"
                    className="h-9 gap-1.5 bg-emerald-600 text-xs hover:bg-emerald-700"
                    onClick={onMarkDelivered}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Delivered
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 text-xs"
                    disabled
                  >
                    Delivered
                  </Button>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
