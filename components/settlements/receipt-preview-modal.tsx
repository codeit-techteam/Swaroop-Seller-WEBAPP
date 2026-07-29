"use client";

import { Download, Printer, Receipt } from "lucide-react";

import { StatusBadge } from "@/components/settlements/status-badge";
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

interface ReceiptPreviewModalProps {
  open: boolean;
  settlement: Settlement | null;
  onOpenChange: (open: boolean) => void;
  onDownload: () => void;
  onPrint: () => void;
}

export function ReceiptPreviewModal({
  open,
  settlement,
  onOpenChange,
  onDownload,
  onPrint,
}: ReceiptPreviewModalProps) {
  const hasPayment = Boolean(settlement?.paymentDetails.utrNumber);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Receipt Preview</DialogTitle>
          <DialogDescription>
            {settlement?.settlementId} · Settlement Receipt
          </DialogDescription>
        </DialogHeader>

        {settlement ? (
          hasPayment ? (
            <div className="space-y-4 py-2">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-100 bg-[#0B1F3A] px-4 py-3 text-white">
                  <p className="text-xs font-semibold uppercase text-white/60">
                    Payment Receipt
                  </p>
                  <p className="text-lg font-bold">{settlement.settlementId}</p>
                </div>
                <div className="space-y-2 p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Net Settlement</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(settlement.netSettlement)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">UTR Number</span>
                    <span className="font-medium text-slate-800">
                      {settlement.paymentDetails.utrNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank</span>
                    <span className="font-medium text-slate-800">
                      {settlement.paymentDetails.bankName} ·{" "}
                      {settlement.paymentDetails.maskedAccountNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500">Status</span>
                    <StatusBadge status={settlement.status} />
                  </div>
                </div>
              </div>

              <div className="flex h-36 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-center">
                  <Receipt className="mx-auto h-10 w-10 text-emerald-500" />
                  <p className="mt-2 text-sm font-medium text-slate-600">
                    Receipt PDF
                  </p>
                  <p className="text-xs text-slate-400">
                    receipt-{settlement.settlementId}.pdf
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <Receipt className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-600">
                No Receipts Available
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Receipt will be generated once settlement is completed.
              </p>
            </div>
          )
        ) : null}

        {hasPayment ? (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button variant="outline" className="gap-2" onClick={onPrint}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              className="gap-2 bg-[#0B1F3A] hover:bg-[#16345A]"
              onClick={onDownload}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        ) : (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
