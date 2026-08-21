"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SlotBooking } from "@/types/slot-booking";

interface CancelSlotModalProps {
  open: boolean;
  slot: SlotBooking | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function CancelSlotModal({
  open,
  slot,
  onOpenChange,
  onConfirm,
}: CancelSlotModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Slot</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel {slot?.slotId}? This action cannot
            be undone from the ADMIN PANEL.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <p>
            <span className="font-semibold text-slate-800">Vehicle:</span>{" "}
            {slot?.vehicleNumber}
          </p>
          <p className="mt-1">
            <span className="font-semibold text-slate-800">Warehouse:</span>{" "}
            {slot?.warehouseLabel}
          </p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep Slot
          </Button>
          <Button className="bg-red-600 hover:bg-red-700" onClick={onConfirm}>
            Confirm Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
