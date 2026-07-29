"use client";

import { format } from "date-fns";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { AcceptOrderForm, Order } from "@/types/orders";

interface AcceptOrderModalProps {
  open: boolean;
  order: Order | null;
  form: AcceptOrderForm;
  onOpenChange: (open: boolean) => void;
  onChange: (data: Partial<AcceptOrderForm>) => void;
  onConfirm: () => void;
}

export function AcceptOrderModal({
  open,
  order,
  form,
  onOpenChange,
  onChange,
  onConfirm,
}: AcceptOrderModalProps) {
  const { handleSubmit } = useForm({ values: form });

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Accept Order & Generate PI</DialogTitle>
          <DialogDescription>
            Confirm acceptance of{" "}
            <span className="font-semibold text-slate-800">
              {order.orderNumber}
            </span>
            . A Proforma Invoice will be generated.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(() => onConfirm())}>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <dl className="space-y-2">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Product</dt>
                <dd className="font-medium text-slate-800">
                  {order.productGrade}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Quantity</dt>
                <dd className="font-medium text-slate-800">
                  {order.quantityMt.toFixed(2)} MT
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Warehouse</dt>
                <dd className="font-medium text-slate-800">
                  {order.warehouseLabel}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Submitted</dt>
                <dd className="font-medium text-slate-800">
                  {format(new Date(order.submittedAt), "MMM dd, yyyy")}
                </dd>
              </div>
            </dl>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedDispatch">Estimated Dispatch</Label>
            <Input
              id="estimatedDispatch"
              type="date"
              value={form.estimatedDispatch}
              onChange={(e) => onChange({ estimatedDispatch: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <Checkbox
              checked={form.generatePi}
              onCheckedChange={(checked) =>
                onChange({ generatePi: Boolean(checked) })
              }
            />
            Generate Proforma Invoice
          </label>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-slate-200"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-teal-700 hover:bg-teal-800">
              Confirm & Generate PI
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
