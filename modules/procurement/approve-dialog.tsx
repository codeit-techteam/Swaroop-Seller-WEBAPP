"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCompactInr, formatNumber } from "@/lib/utils";
import type { ProcurementItem } from "@/types/procurement";

interface ApproveDialogProps {
  item: ProcurementItem | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ApproveDialog({
  item,
  open,
  onClose,
  onConfirm,
}: ApproveDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Approve this procurement and create Procurement Order?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Confirm approval for this procurement record.</p>
              {item ? (
                <dl className="grid grid-cols-2 gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-slate-800">
                  <div>
                    <dt className="text-[11px] uppercase text-slate-500">PR ID</dt>
                    <dd className="font-semibold">{item.requestId}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase text-slate-500">
                      Commodity
                    </dt>
                    <dd className="font-semibold">
                      {item.commodity} {item.grade}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase text-slate-500">
                      Supplier
                    </dt>
                    <dd className="font-semibold">{item.supplier}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase text-slate-500">
                      Quantity
                    </dt>
                    <dd className="font-semibold">
                      {formatNumber(item.quantityMt)} {item.quantityUnit}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[11px] uppercase text-slate-500">
                      Estimated Value
                    </dt>
                    <dd className="font-semibold">
                      {formatCompactInr(item.estimatedCost)}
                    </dd>
                  </div>
                </dl>
              ) : null}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-[#1B6EF3] hover:bg-[#1558C8]"
            onClick={onConfirm}
          >
            Approve & Create PO
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
