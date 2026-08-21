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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { allowedStatusUpdates } from "@/lib/orders/lifecycle";
import type {
  Order,
  StatusUpdateForm,
  StatusUpdateValue,
} from "@/types/orders";
import {
  isPaymentClearedForDispatch,
  ORDER_STATUS_LABELS,
  STATUS_UPDATE_OPTIONS,
} from "@/types/orders";

interface UpdateStatusModalProps {
  open: boolean;
  order: Order | null;
  form: StatusUpdateForm;
  onOpenChange: (open: boolean) => void;
  onChange: (data: Partial<StatusUpdateForm>) => void;
  onSubmit: () => void;
}

export function UpdateStatusModal({
  open,
  order,
  form,
  onOpenChange,
  onChange,
  onSubmit,
}: UpdateStatusModalProps) {
  const { handleSubmit } = useForm({
    values: form,
  });

  if (!order) return null;

  const allowed = allowedStatusUpdates(order);
  const options = STATUS_UPDATE_OPTIONS.filter((opt) =>
    allowed.includes(opt.value),
  );
  const needsTransport =
    form.status === "dispatched" || form.status === "in_transit";
  const paymentBlocked =
    order.paymentTerm === "advance" && !isPaymentClearedForDispatch(order);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Advance{" "}
            <span className="font-semibold text-slate-800">
              {order.orderNumber}
            </span>{" "}
            along the delivery lifecycle. Only the next valid steps are shown.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={handleSubmit(() => {
            if (!form.status) return;
            onSubmit();
          })}
        >
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Current Status
            </p>
            <p className="mt-0.5 font-semibold text-slate-800">
              {ORDER_STATUS_LABELS[order.status]}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Payment: {order.paymentLabel} · {order.payment.status}
            </p>
          </div>

          {paymentBlocked ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Advance payment is not verified yet. Dispatch steps stay locked
              until verification.
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            {options.length === 0 ? (
              <p className="text-sm text-slate-500">
                No further status updates from this stage. Use the guided Manage
                Order actions instead.
              </p>
            ) : (
              <Select
                value={form.status || undefined}
                onValueChange={(v) =>
                  onChange({ status: v as StatusUpdateValue })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {needsTransport ? (
            <div className="space-y-3 rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Transport (required for dispatch)
              </p>
              <div className="space-y-2">
                <Label htmlFor="carrier">Carrier</Label>
                <Input
                  id="carrier"
                  value={form.carrier ?? ""}
                  onChange={(e) => onChange({ carrier: e.target.value })}
                  placeholder="Carrier name"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="veh">Vehicle</Label>
                  <Input
                    id="veh"
                    value={form.vehicleNumber ?? ""}
                    onChange={(e) =>
                      onChange({ vehicleNumber: e.target.value })
                    }
                    placeholder="GJ-01-AB-1234"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drv">Driver</Label>
                  <Input
                    id="drv"
                    value={form.driver ?? ""}
                    onChange={(e) => onChange({ driver: e.target.value })}
                    placeholder="Driver name"
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={form.remarks}
              onChange={(e) => onChange({ remarks: e.target.value })}
              placeholder="Optional notes for this status change"
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
              disabled={!form.status || options.length === 0}
              className="bg-[#1B6EF3] hover:bg-[#1558C8]"
            >
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
