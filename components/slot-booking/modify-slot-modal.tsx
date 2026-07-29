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
import type {
  ModifySlotFormData,
  SlotBooking,
  WarehouseCode,
} from "@/types/slot-booking";
import { SLOT_WAREHOUSES } from "@/types/slot-booking";

interface ModifySlotModalProps {
  open: boolean;
  slot: SlotBooking | null;
  form: ModifySlotFormData;
  onFormChange: (data: Partial<ModifySlotFormData>) => void;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function ModifySlotModal({
  open,
  slot,
  form,
  onFormChange,
  onOpenChange,
  onSave,
}: ModifySlotModalProps) {
  const { handleSubmit } = useForm({ values: form });

  const canSave =
    Boolean(form.dispatchDate) &&
    Boolean(form.warehouse) &&
    Boolean(form.vehicleNumber) &&
    Boolean(form.driver);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modify Slot</DialogTitle>
          <DialogDescription>
            Update booking details for {slot?.slotId}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-3 py-2"
          onSubmit={handleSubmit(() => {
            if (canSave) onSave();
          })}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.dispatchDate}
                onChange={(e) => onFormChange({ dispatchDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time Slot</Label>
              <Input
                id="time"
                value={form.timeSlot}
                onChange={(e) => onFormChange({ timeSlot: e.target.value })}
                placeholder="08:00 - 10:00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Warehouse</Label>
            <Select
              value={form.warehouse || undefined}
              onValueChange={(v) =>
                onFormChange({ warehouse: v as WarehouseCode })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select warehouse" />
              </SelectTrigger>
              <SelectContent>
                {SLOT_WAREHOUSES.filter((w) => w !== "All Warehouses").map(
                  (w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bay">Loading Bay</Label>
            <Input
              id="bay"
              value={form.loadingBay}
              onChange={(e) => onFormChange({ loadingBay: e.target.value })}
              placeholder="04"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle">Vehicle</Label>
            <Input
              id="vehicle"
              value={form.vehicleNumber}
              onChange={(e) => onFormChange({ vehicleNumber: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver">Driver</Label>
            <Input
              id="driver"
              value={form.driver}
              onChange={(e) => onFormChange({ driver: e.target.value })}
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
              disabled={!canSave}
              className="bg-[#1B6EF3] hover:bg-[#1558C8]"
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
