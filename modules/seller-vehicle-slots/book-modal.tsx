"use client";

import { SellerStatusBadge } from "@/components/status/seller-status-badge";
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
import { OPS_WAREHOUSES } from "@/lib/mock/seller-ops";
import { canBookTimeSlot, slotGridFor } from "@/lib/seller-ops";
import {
  type BookVehicleSlotInput,
  LOADING_BAYS,
  VEHICLE_TYPES,
  type VehicleSlot,
} from "@/types/seller-ops";

export type BookSlotForm = BookVehicleSlotInput;

const EMPTY: BookSlotForm = {
  orderId: "",
  purchaseRequestId: "",
  warehouseId: "wh-chennai",
  quantityMt: 20,
  vehicleType: "Trailer",
  vehicleNumber: "",
  carrier: "",
  driverName: "",
  driverPhone: "",
  date: "2026-09-10",
  timeSlot: "10:00–11:00",
  loadingBay: "Bay 03",
  notes: "",
};

export function BookVehicleSlotModal({
  open,
  busy,
  mode = "book",
  slots,
  form,
  onChange,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  busy?: boolean;
  mode?: "book" | "reschedule";
  slots: VehicleSlot[];
  form: BookSlotForm;
  onChange: (form: BookSlotForm) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}) {
  const grid = slotGridFor(form.warehouseId, form.date, slots);
  const selected = grid.find((item) => item.timeSlot === form.timeSlot);
  const canSubmit =
    form.orderId.trim() &&
    form.vehicleNumber.trim() &&
    form.carrier.trim() &&
    form.driverName.trim() &&
    form.driverPhone.trim() &&
    selected &&
    canBookTimeSlot(selected.availability);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "reschedule" ? "Reschedule vehicle slot" : "Book vehicle slot"}
          </DialogTitle>
          <DialogDescription>
            Choose an available loading window. Full or blocked slots cannot be booked.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="order-id">Order</Label>
            <Input
              id="order-id"
              value={form.orderId}
              onChange={(event) =>
                onChange({ ...form, orderId: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Warehouse</Label>
            <Select
              value={form.warehouseId}
              onValueChange={(warehouseId) => onChange({ ...form, warehouseId })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPS_WAREHOUSES.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qty">Dispatch Quantity (MT)</Label>
            <Input
              id="qty"
              type="number"
              min="1"
              value={form.quantityMt}
              onChange={(event) =>
                onChange({ ...form, quantityMt: Number(event.target.value) })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Vehicle Type</Label>
            <Select
              value={form.vehicleType}
              onValueChange={(vehicleType) =>
                onChange({
                  ...form,
                  vehicleType: vehicleType as BookSlotForm["vehicleType"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_TYPES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vehicle">Vehicle Number</Label>
            <Input
              id="vehicle"
              value={form.vehicleNumber}
              onChange={(event) =>
                onChange({ ...form, vehicleNumber: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="carrier">Carrier</Label>
            <Input
              id="carrier"
              value={form.carrier}
              onChange={(event) =>
                onChange({ ...form, carrier: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="driver">Driver Name</Label>
            <Input
              id="driver"
              value={form.driverName}
              onChange={(event) =>
                onChange({ ...form, driverName: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Driver Phone</Label>
            <Input
              id="phone"
              value={form.driverPhone}
              onChange={(event) =>
                onChange({ ...form, driverPhone: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date">Preferred Date</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(event) => onChange({ ...form, date: event.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Loading Bay</Label>
            <Select
              value={form.loadingBay}
              onValueChange={(loadingBay) => onChange({ ...form, loadingBay })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOADING_BAYS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Preferred Time Slot</Label>
            <div className="grid grid-cols-2 gap-2">
              {grid.map((item) => {
                const disabled = !canBookTimeSlot(item.availability);
                return (
                  <button
                    key={item.timeSlot}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange({ ...form, timeSlot: item.timeSlot })}
                    className={`rounded-lg border px-3 py-2 text-left text-xs ${
                      form.timeSlot === item.timeSlot
                        ? "border-[#1B6EF3] bg-[#E8F1FF]"
                        : "border-slate-200"
                    } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <p className="font-medium">{item.timeSlot}</p>
                    <div className="mt-1">
                      <SellerStatusBadge status={item.availability} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={2}
              value={form.notes}
              onChange={(event) =>
                onChange({ ...form, notes: event.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-[#0B1F3A] hover:bg-[#122846]"
            disabled={busy || !canSubmit}
            onClick={onSubmit}
          >
            {busy
              ? "Saving..."
              : mode === "reschedule"
                ? "Save schedule"
                : "Confirm Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { EMPTY as emptyBookSlotForm };
