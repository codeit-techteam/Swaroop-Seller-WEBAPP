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
import type { AssignTransportForm, Order } from "@/types/orders";

interface AssignTransportModalProps {
  open: boolean;
  order: Order | null;
  form: AssignTransportForm;
  onOpenChange: (open: boolean) => void;
  onChange: (data: Partial<AssignTransportForm>) => void;
  onSubmit: () => void;
}

export function AssignTransportModal({
  open,
  order,
  form,
  onOpenChange,
  onChange,
  onSubmit,
}: AssignTransportModalProps) {
  const { handleSubmit } = useForm({ values: form });
  if (!order) return null;

  const valid =
    form.carrier.trim() &&
    form.vehicleNumber.trim() &&
    form.driver.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Transport</DialogTitle>
          <DialogDescription>
            Assign carrier and vehicle for{" "}
            <span className="font-semibold text-slate-800">
              {order.orderNumber}
            </span>{" "}
            from {order.warehouseLabel}.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-3" onSubmit={handleSubmit(() => onSubmit())}>
          <div className="space-y-2">
            <Label htmlFor="carrier">Carrier</Label>
            <Input
              id="carrier"
              value={form.carrier}
              onChange={(e) => onChange({ carrier: e.target.value })}
              placeholder="VRL Logistics Ltd."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle No.</Label>
              <Input
                id="vehicle"
                value={form.vehicleNumber}
                onChange={(e) => onChange({ vehicleNumber: e.target.value })}
                placeholder="GJ-01-AB-1234"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eta">ETA</Label>
              <Input
                id="eta"
                value={form.eta}
                onChange={(e) => onChange({ eta: e.target.value })}
                placeholder="dd/mm/yyyy"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="driver">Driver</Label>
              <Input
                id="driver"
                value={form.driver}
                onChange={(e) => onChange({ driver: e.target.value })}
                placeholder="Driver name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Driver Phone</Label>
              <Input
                id="phone"
                value={form.driverPhone}
                onChange={(e) => onChange({ driverPhone: e.target.value })}
                placeholder="98XXXXXXXX"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Current / Start Location</Label>
            <Input
              id="location"
              value={form.currentLocation}
              onChange={(e) => onChange({ currentLocation: e.target.value })}
              placeholder={order.warehouseLabel}
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
              disabled={!valid}
              className="bg-[#1B6EF3] hover:bg-[#1558C8]"
            >
              Save Transport
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
