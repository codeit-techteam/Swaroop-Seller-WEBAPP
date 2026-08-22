"use client";

import { format } from "date-fns";

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
import type { PurchaseRequest } from "@/types/purchase-requests";

interface AcceptDialogProps {
  open: boolean;
  request: PurchaseRequest | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function AcceptDialog({
  open,
  request,
  onOpenChange,
  onConfirm,
}: AcceptDialogProps) {
  if (!request) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Accept Request</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                You are about to accept{" "}
                <span className="font-semibold text-slate-900">
                  {request.requestNumber}
                </span>
                . This will create an order and mark the request as accepted.
              </p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-left">
                <dl className="space-y-2">
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Product</dt>
                    <dd className="font-medium text-slate-800">
                      {request.productName}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Quantity</dt>
                    <dd className="font-medium text-slate-800">
                      {request.quantityMt.toFixed(2)} MT
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Dispatch Deadline</dt>
                    <dd className="font-medium text-slate-800">
                      {format(new Date(request.deadline), "MMM dd, yyyy")}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-[#0B1F3A] hover:bg-[#122846]"
            onClick={onConfirm}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
