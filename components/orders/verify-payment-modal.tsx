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
import type { Order, VerifyPaymentForm } from "@/types/orders";

interface VerifyPaymentModalProps {
  open: boolean;
  order: Order | null;
  form: VerifyPaymentForm;
  onOpenChange: (open: boolean) => void;
  onChange: (data: Partial<VerifyPaymentForm>) => void;
  onSubmit: () => void;
}

export function VerifyPaymentModal({
  open,
  order,
  form,
  onOpenChange,
  onChange,
  onSubmit,
}: VerifyPaymentModalProps) {
  const { handleSubmit } = useForm({ values: form });
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Payment</DialogTitle>
          <DialogDescription>
            Confirm payment for{" "}
            <span className="font-semibold text-slate-800">
              {order.orderNumber}
            </span>{" "}
            ({order.paymentLabel}) before warehouse processing / dispatch.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={handleSubmit(() => onSubmit())}
        >
          <div className="space-y-2">
            <Label htmlFor="utr">UTR / Bank Reference</Label>
            <Input
              id="utr"
              value={form.utr}
              onChange={(e) => onChange({ utr: e.target.value })}
              placeholder="e.g. UTR2458123901"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amountPaid">Amount Paid (₹)</Label>
            <Input
              id="amountPaid"
              type="number"
              value={form.amountPaid}
              onChange={(e) => onChange({ amountPaid: e.target.value })}
              placeholder={String(order.payment.amountDue)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="proof">Proof file name</Label>
            <Input
              id="proof"
              value={form.proofFileName}
              onChange={(e) => onChange({ proofFileName: e.target.value })}
              placeholder="neft-receipt.pdf"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pay-notes">Notes</Label>
            <Textarea
              id="pay-notes"
              value={form.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              rows={2}
              placeholder="Optional verification notes"
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
              className="bg-[#1B6EF3] hover:bg-[#1558C8]"
              disabled={!form.utr.trim() || !form.amountPaid}
            >
              Confirm Verification
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
