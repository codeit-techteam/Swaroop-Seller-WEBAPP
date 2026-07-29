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
import { formatCurrency } from "@/lib/utils";
import type { Settlement } from "@/types/settlements";

interface InvoicePreviewModalProps {
  open: boolean;
  settlement: Settlement | null;
  onOpenChange: (open: boolean) => void;
  onDownload: () => void;
  onPrint: () => void;
}

export function InvoicePreviewModal({
  open,
  settlement,
  onOpenChange,
  onDownload,
  onPrint,
}: InvoicePreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
          <DialogDescription>
            {settlement?.settlementId} · {settlement?.invoiceId}
          </DialogDescription>
        </DialogHeader>

        {settlement ? (
          <div className="space-y-4 py-2">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Tax Invoice
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {settlement.invoiceId}
                </p>
              </div>
              <div className="space-y-2 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Buyer Company</span>
                  <span className="font-medium text-slate-800">
                    {settlement.buyerCompany}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Order Reference</span>
                  <span className="font-medium text-slate-800">
                    {settlement.orderRef}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Product</span>
                  <span className="font-medium text-slate-800">
                    {settlement.product}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Quantity</span>
                  <span className="font-medium text-slate-800">
                    {settlement.quantityMt.toFixed(2)} MT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Warehouse</span>
                  <span className="font-medium text-slate-800">
                    {settlement.warehouse}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2">
                  <span className="font-semibold text-slate-700">
                    Invoice Amount
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(settlement.invoiceAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex h-40 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
              <div className="text-center">
                <FileText className="mx-auto h-10 w-10 text-red-400" />
                <p className="mt-2 text-sm font-medium text-slate-600">
                  PDF Preview
                </p>
                <p className="text-xs text-slate-400">
                  {settlement.invoiceId}.pdf
                </p>
              </div>
            </div>
          </div>
        ) : null}

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
      </DialogContent>
    </Dialog>
  );
}
