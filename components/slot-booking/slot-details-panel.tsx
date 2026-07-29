"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Download, QrCode, X } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SlotBooking, SlotDocStatus } from "@/types/slot-booking";

function DocBadge({ status }: { status: SlotDocStatus }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase",
        status === "missing"
          ? "border-dashed border-red-300 text-red-600"
          : status === "verified"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-emerald-200 bg-emerald-50 text-emerald-700",
      )}
    >
      {status}
    </span>
  );
}

interface SlotDetailsPanelProps {
  open: boolean;
  slot: SlotBooking | null;
  onClose: () => void;
  onDownloadGatePass: () => void;
  onModify: () => void;
  onCancel: () => void;
}

export function SlotDetailsPanel({
  open,
  slot,
  onClose,
  onDownloadGatePass,
  onModify,
  onCancel,
}: SlotDetailsPanelProps) {
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
      {open && slot ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/30 xl:bg-transparent xl:pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Slot Details: {slot.slotId}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {slot.warehouseLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6">
                <div className="relative flex h-40 w-40 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white">
                  <QrCode
                    className="h-28 w-28 text-slate-800"
                    strokeWidth={1}
                  />
                </div>
                <p className="mt-3 text-center text-[10px] font-mono text-slate-400">
                  {slot.qrCodeData}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Purchase Request
                </p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {slot.purchaseRequestId}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-slate-100 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase text-slate-400">
                    Material
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {slot.material}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-100 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase text-slate-400">
                    Quantity
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {slot.quantityMt.toFixed(1)} MT
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Checklist
                </h4>
                {[
                  {
                    label: "Security Status",
                    value: slot.checklist.securityVerified
                      ? "Verified"
                      : "Pending",
                    ok: slot.checklist.securityVerified,
                  },
                  {
                    label: "Weighbridge",
                    value: slot.checklist.weighbridgeReady
                      ? "Ready"
                      : "Pending",
                    ok: slot.checklist.weighbridgeReady,
                  },
                  {
                    label: "Gate Entry",
                    value: slot.checklist.gateEntry ? "Done" : "Pending",
                    ok: slot.checklist.gateEntry,
                  },
                  {
                    label: "Loading Approved",
                    value: slot.checklist.loadingApproved ? "Yes" : "Pending",
                    ok: slot.checklist.loadingApproved,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-600">{item.label}</span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                      {item.ok ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : null}
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Document Checklist
                </h4>
                <ul className="space-y-2">
                  {slot.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-slate-700">{doc.label}</span>
                      <DocBadge status={doc.status} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="shrink-0 space-y-2 border-t border-slate-100 px-5 py-4">
              <Button
                className="h-11 w-full gap-2 bg-[#0B1F3A] hover:bg-[#16345A]"
                onClick={onDownloadGatePass}
                disabled={slot.status === "cancelled"}
              >
                <Download className="h-4 w-4" />
                Download Gate Pass
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-10 border-slate-200"
                  onClick={onModify}
                  disabled={
                    slot.status === "cancelled" || slot.status === "completed"
                  }
                >
                  Modify
                </Button>
                <Button
                  variant="outline"
                  className="h-10 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={onCancel}
                  disabled={
                    slot.status === "cancelled" || slot.status === "completed"
                  }
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
