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
import type { MarkDeliveredForm, Order } from "@/types/orders";

interface MarkDeliveredModalProps {
  open: boolean;
  order: Order | null;
  form: MarkDeliveredForm;
  onOpenChange: (open: boolean) => void;
  onChange: (data: Partial<MarkDeliveredForm>) => void;
  onSubmit: () => void;
}

export function MarkDeliveredModal({
  open,
  order,
  form,
  onOpenChange,
  onChange,
  onSubmit,
}: MarkDeliveredModalProps) {
  const { handleSubmit } = useForm({ values: form });
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Delivery</DialogTitle>
          <DialogDescription>
            Capture proof of delivery for{" "}
            <span className="font-semibold text-slate-800">
              {order.orderNumber}
            </span>
            . This closes the order lifecycle.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(() => onSubmit())}>
          <div className="space-y-2">
            <Label htmlFor="receiver">Receiver Name</Label>
            <Input
              id="receiver"
              value={form.receiverName}
              onChange={(e) => onChange({ receiverName: e.target.value })}
              placeholder="Store in-charge / consignee"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pod-file">POD File Name</Label>
            <Input
              id="pod-file"
              value={form.fileName}
              onChange={(e) => onChange({ fileName: e.target.value })}
              placeholder="pod-signed.pdf"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.otpVerified}
              onChange={(e) => onChange({ otpVerified: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300"
            />
            OTP verified with consignee
          </label>
          <div className="space-y-2">
            <Label htmlFor="pod-notes">Delivery Notes</Label>
            <Textarea
              id="pod-notes"
              value={form.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              rows={2}
              placeholder="Condition of goods, shortage notes…"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!form.receiverName.trim()}
              className="bg-emerald-700 hover:bg-emerald-800"
            >
              Mark Delivered
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
