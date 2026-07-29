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
import type { DispatchOrder, GenerateEwayFormData } from "@/types/dispatch";

interface GenerateEwayModalProps {
  open: boolean;
  dispatch: DispatchOrder | null;
  form: GenerateEwayFormData;
  onFormChange: (data: Partial<GenerateEwayFormData>) => void;
  onOpenChange: (open: boolean) => void;
  onGenerate: () => void;
}

export function GenerateEwayModal({
  open,
  dispatch,
  form,
  onFormChange,
  onOpenChange,
  onGenerate,
}: GenerateEwayModalProps) {
  const { handleSubmit } = useForm({ values: form });

  const canSubmit =
    Boolean(form.invoiceNumber.trim()) &&
    Boolean(form.gstNumber.trim()) &&
    Boolean(form.destination.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate E-Way Bill</DialogTitle>
          <DialogDescription>
            Create e-way for {dispatch?.orderNumber ?? "dispatch"} ·{" "}
            {dispatch?.material}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4 py-2"
          onSubmit={handleSubmit(() => {
            if (canSubmit) onGenerate();
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="invoice">Invoice Number</Label>
            <Input
              id="invoice"
              value={form.invoiceNumber}
              onChange={(e) => onFormChange({ invoiceNumber: e.target.value })}
              placeholder="INV-2026-0001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gst">GST</Label>
            <Input
              id="gst"
              value={form.gstNumber}
              onChange={(e) => onFormChange({ gstNumber: e.target.value })}
              placeholder="24AABCR...."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              value={form.destination}
              onChange={(e) => onFormChange({ destination: e.target.value })}
              placeholder="Destination hub"
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
              className="bg-teal-600 hover:bg-teal-700"
            >
              Generate & Download PDF
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
