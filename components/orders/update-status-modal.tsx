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
import type {
  Order,
  StatusUpdateForm,
  StatusUpdateValue,
} from "@/types/orders";
import { ORDER_STATUS_LABELS, STATUS_UPDATE_OPTIONS } from "@/types/orders";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Update dispatch status for{" "}
            <span className="font-semibold text-slate-800">
              {order.orderNumber}
            </span>
            . Timeline will refresh instantly.
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
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
                {STATUS_UPDATE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
              disabled={!form.status}
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
