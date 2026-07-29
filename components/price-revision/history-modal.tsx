"use client";

import { format, parseISO } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PriceRevisionRequest } from "@/types/price-revision";

import { AuditTimeline } from "./audit-timeline";
import { StatusBadge } from "./status-badge";

interface HistoryModalProps {
  open: boolean;
  request: PriceRevisionRequest | null;
  onOpenChange: (open: boolean) => void;
}

export function HistoryModal({
  open,
  request,
  onOpenChange,
}: HistoryModalProps) {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Revision History</DialogTitle>
          <DialogDescription>
            Audit trail for #{request.requestId}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <div>
              <p className="text-sm font-medium text-slate-800">
                {request.productName}
              </p>
              <p className="text-xs text-slate-500">
                Received{" "}
                {format(parseISO(request.receivedAt), "MMM d, yyyy · h:mm a")}
              </p>
            </div>
            <StatusBadge status={request.status} />
          </div>
          <AuditTimeline steps={request.timeline} />
          {request.counterOffer ? (
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 px-3 py-2 text-sm">
              <p className="font-medium text-blue-800">
                Counter Offer Submitted
              </p>
              <p className="mt-1 text-xs text-blue-700">
                ₹{request.counterOffer.counterPrice}/MT · MOQ{" "}
                {request.counterOffer.moq} MT · Validity{" "}
                {request.counterOffer.validity}
              </p>
            </div>
          ) : null}
          {request.rejectReason ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm">
              <p className="font-medium text-red-800">Rejection Reason</p>
              <p className="mt-1 text-xs text-red-700">
                {request.rejectReason}
              </p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
