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
import type { GenerateEwayFormData, Shipment } from "@/types/shipments";

interface GenerateEWayModalProps {
  open: boolean;
  shipment: Shipment | null;
  form: GenerateEwayFormData;
  onFormChange: (data: Partial<GenerateEwayFormData>) => void;
  onOpenChange: (open: boolean) => void;
  onGenerate: () => void;
}

export function GenerateEWayModal({
  open,
  shipment,
  form,
  onFormChange,
  onOpenChange,
  onGenerate,
}: GenerateEWayModalProps) {
  const { handleSubmit } = useForm({ values: form });

  const canSubmit =
    Boolean(form.invoiceNumber.trim()) &&
    Boolean(form.gstNumber.trim()) &&
    Boolean(form.vehicle.trim()) &&
    Boolean(form.destination.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate E-Way Bill</DialogTitle>
          <DialogDescription>
            Create e-way bill for {shipment?.shipmentId ?? "shipment"} ·{" "}
            {shipment?.product}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4 py-2"
          onSubmit={handleSubmit(() => {
            if (canSubmit) onGenerate();
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="eway-invoice">Invoice Number</Label>
            <Input
              id="eway-invoice"
              value={form.invoiceNumber}
              onChange={(e) => onFormChange({ invoiceNumber: e.target.value })}
              placeholder="INV-2026-0001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eway-gst">GST Number</Label>
            <Input
              id="eway-gst"
              value={form.gstNumber}
              onChange={(e) => onFormChange({ gstNumber: e.target.value })}
              placeholder="24AABCR...."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eway-vehicle">Vehicle</Label>
            <Input
              id="eway-vehicle"
              value={form.vehicle}
              onChange={(e) => onFormChange({ vehicle: e.target.value })}
              placeholder="GJ-06-AZ-1102"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eway-destination">Destination</Label>
            <Input
              id="eway-destination"
              value={form.destination}
              onChange={(e) => onFormChange({ destination: e.target.value })}
              placeholder="Destination warehouse"
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
