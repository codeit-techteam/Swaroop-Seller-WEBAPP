"use client";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MarkDeliveredFormData, Shipment } from "@/types/shipments";

interface MarkDeliveredModalProps {
  open: boolean;
  shipment: Shipment | null;
  form: MarkDeliveredFormData;
  onFormChange: (data: Partial<MarkDeliveredFormData>) => void;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function MarkDeliveredModal({
  open,
  shipment,
  form,
  onFormChange,
  onOpenChange,
  onConfirm,
}: MarkDeliveredModalProps) {
  const { handleSubmit } = useForm({ values: form });

  const canSubmit = Boolean(form.receiverName.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Delivery</DialogTitle>
          <DialogDescription>
            Mark {shipment?.shipmentId ?? "shipment"} as delivered. This will
            update the shipment status and timeline.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4 py-2"
          onSubmit={handleSubmit(() => {
            if (canSubmit) onConfirm();
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="delivery-date">Delivery Date</Label>
            <Input
              id="delivery-date"
              type="date"
              value={form.deliveryDate}
              onChange={(e) => onFormChange({ deliveryDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receiver-name">Receiver Name</Label>
            <Input
              id="receiver-name"
              value={form.receiverName}
              onChange={(e) => onFormChange({ receiverName: e.target.value })}
              placeholder="Warehouse receiver name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receiver-signature">Receiver Signature</Label>
            <Input
              id="receiver-signature"
              value={form.receiverSignature}
              onChange={(e) =>
                onFormChange({ receiverSignature: e.target.value })
              }
              placeholder="Initials or signature reference"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery-notes">Delivery Notes</Label>
            <Textarea
              id="delivery-notes"
              value={form.deliveryNotes}
              onChange={(e) => onFormChange({ deliveryNotes: e.target.value })}
              placeholder="Optional delivery notes..."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Confirm Delivery
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
