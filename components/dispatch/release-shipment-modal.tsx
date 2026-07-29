"use client";

import { AlertTriangle, CheckCircle2, Circle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { DispatchOrder } from "@/types/dispatch";

interface ReleaseShipmentModalProps {
  open: boolean;
  dispatch: DispatchOrder | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const RELEASE_CHECKS = [
  { key: "paymentVerified" as const, label: "Payment Verified" },
  { key: "invoiceGenerated" as const, label: "Invoice Generated" },
  { key: "ewayGenerated" as const, label: "E-Way Bill Generated" },
  { key: "vehicleAssigned" as const, label: "Vehicle Assigned" },
  { key: "loadingCompleted" as const, label: "Loading Completed" },
];

export function ReleaseShipmentModal({
  open,
  dispatch,
  onOpenChange,
  onConfirm,
}: ReleaseShipmentModalProps) {
  const checks = RELEASE_CHECKS.map((check) => {
    const item = dispatch?.checklist.find((c) => c.key === check.key);
    const done =
      item?.status === "completed" ||
      (check.key === "loadingCompleted" &&
        dispatch?.status === "ready_for_release");
    return { ...check, done: Boolean(done) };
  });

  const allDone = checks.every((c) => c.done);
  const hasVehicle = Boolean(dispatch?.transport);
  const canRelease = allDone && hasVehicle;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Release Shipment</DialogTitle>
          <DialogDescription>
            Confirm release for {dispatch?.orderNumber}. Checklist must be
            complete.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <ul className="space-y-2">
            {checks.map((check) => (
              <li
                key={check.key}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                {check.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-300" />
                )}
                <span className={cn(!check.done && "text-slate-400")}>
                  {check.label}
                </span>
              </li>
            ))}
            <li className="flex items-center gap-2 text-sm text-slate-700">
              {hasVehicle ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <Circle className="h-4 w-4 text-slate-300" />
              )}
              <span className={cn(!hasVehicle && "text-slate-400")}>
                Transport Assigned
              </span>
            </li>
          </ul>

          {!canRelease ? (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Complete all checklist items and assign a vehicle before
              releasing.
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              All validations passed. Shipment is ready for release.
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canRelease}
            className="bg-teal-600 hover:bg-teal-700"
            onClick={onConfirm}
          >
            Confirm Release
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
