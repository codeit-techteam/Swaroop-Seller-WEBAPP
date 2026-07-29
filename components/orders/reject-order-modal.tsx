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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Order, RejectOrderForm, RejectReason } from "@/types/orders";
import { REJECT_REASONS } from "@/types/orders";

interface RejectOrderModalProps {
  open: boolean;
  order: Order | null;
  form: RejectOrderForm;
  onOpenChange: (open: boolean) => void;
  onChange: (data: Partial<RejectOrderForm>) => void;
  onConfirm: () => void;
}

export function RejectOrderModal({
  open,
  order,
  form,
  onOpenChange,
  onChange,
  onConfirm,
}: RejectOrderModalProps) {
  const { handleSubmit } = useForm({ values: form });

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Order</DialogTitle>
          <DialogDescription>
            Reject{" "}
            <span className="font-semibold text-slate-800">
              {order.orderNumber}
            </span>
            . This action will mark the order as cancelled.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={handleSubmit(() => {
            if (!form.reason) return;
            onConfirm();
          })}
        >
          <div className="space-y-2">
            <Label>Reason</Label>
            <Select
              value={form.reason || undefined}
              onValueChange={(v) => onChange({ reason: v as RejectReason })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {REJECT_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reject-remarks">Remarks</Label>
            <Textarea
              id="reject-remarks"
              value={form.remarks}
              onChange={(e) => onChange({ remarks: e.target.value })}
              placeholder="Optional additional remarks"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-slate-200"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!form.reason}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
