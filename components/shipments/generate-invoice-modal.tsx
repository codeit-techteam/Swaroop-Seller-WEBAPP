"use client";

import { Download, FileText, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Shipment } from "@/types/shipments";

interface GenerateInvoiceModalProps {
  open: boolean;
  shipment: Shipment | null;
  onOpenChange: (open: boolean) => void;
  onGenerate: () => void;
  onDownload: () => void;
  onPrint: () => void;
}

export function GenerateInvoiceModal({
  open,
  shipment,
  onOpenChange,
  onGenerate,
  onDownload,
  onPrint,
}: GenerateInvoiceModalProps) {
  const hasInvoice = Boolean(shipment?.invoiceNumber);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {hasInvoice ? "Invoice Preview" : "Generate Invoice"}
          </DialogTitle>
          <DialogDescription>
            {shipment?.shipmentId} · {shipment?.buyerCompany}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!hasInvoice ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <FileText className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-600">
                Invoice not generated yet for this shipment.
              </p>
              <Button
                className="mt-4 bg-[#1B6EF3] hover:bg-[#1558C9]"
                onClick={onGenerate}
              >
                Generate Invoice
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Tax Invoice
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {shipment?.invoiceNumber}
                  </p>
                </div>
                <div className="space-y-2 p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Buyer</span>
                    <span className="font-medium text-slate-800">
                      {shipment?.buyerCompany}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Product</span>
                    <span className="font-medium text-slate-800">
                      {shipment?.product}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quantity</span>
                    <span className="font-medium text-slate-800">
                      {shipment?.quantityMt.toFixed(1)} MT
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2">
                    <span className="font-semibold text-slate-700">Total</span>
                    <span className="font-bold text-slate-900">
                      ₹
                      {((shipment?.quantityMt ?? 0) * 85000).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex h-48 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-red-400" />
                  <p className="mt-2 text-sm font-medium text-slate-600">
                    PDF Preview
                  </p>
                  <p className="text-xs text-slate-400">
                    {shipment?.invoiceNumber}.pdf
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {hasInvoice ? (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button variant="outline" className="gap-2" onClick={onPrint}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              className="gap-2 bg-[#1B6EF3] hover:bg-[#1558C9]"
              onClick={onDownload}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
