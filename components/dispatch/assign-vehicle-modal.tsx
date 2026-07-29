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
  AssignVehicleFormData,
  DispatchOrder,
  DriverOption,
  TransportCompanyOption,
  VehicleOption,
} from "@/types/dispatch";

interface AssignVehicleModalProps {
  open: boolean;
  dispatch: DispatchOrder | null;
  form: AssignVehicleFormData;
  vehicles: VehicleOption[];
  drivers: DriverOption[];
  companies: TransportCompanyOption[];
  onFormChange: (data: Partial<AssignVehicleFormData>) => void;
  onOpenChange: (open: boolean) => void;
  onAssign: () => void;
}

export function AssignVehicleModal({
  open,
  dispatch,
  form,
  vehicles,
  drivers,
  companies,
  onFormChange,
  onOpenChange,
  onAssign,
}: AssignVehicleModalProps) {
  const { handleSubmit } = useForm({
    values: form,
  });

  const canSubmit =
    Boolean(form.vehicleNumber) &&
    Boolean(form.driver) &&
    Boolean(form.transportCompany);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Vehicle</DialogTitle>
          <DialogDescription>
            Assign transport for {dispatch?.orderNumber ?? "dispatch"}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4 py-2"
          onSubmit={handleSubmit(() => {
            if (canSubmit) onAssign();
          })}
        >
          <div className="space-y-2">
            <Label>Vehicle</Label>
            <Select
              value={form.vehicleNumber || undefined}
              onValueChange={(value) => {
                const vehicle = vehicles.find((v) => v.number === value);
                onFormChange({
                  vehicleNumber: value,
                  capacityMt: vehicle
                    ? String(vehicle.capacityMt)
                    : form.capacityMt,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.number}>
                    {v.number} · {v.capacityMt} MT · {v.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Driver</Label>
            <Select
              value={form.driver || undefined}
              onValueChange={(value) => onFormChange({ driver: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select driver" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.name}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Transport Company</Label>
            <Select
              value={form.transportCompany || undefined}
              onValueChange={(value) =>
                onFormChange({ transportCompany: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="eta">Estimated Arrival</Label>
              <Input
                id="eta"
                placeholder="e.g. 08:45 AM"
                value={form.estimatedArrival}
                onChange={(e) =>
                  onFormChange({ estimatedArrival: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bay">Loading Bay</Label>
              <Input
                id="bay"
                placeholder="e.g. 04"
                value={form.loadingBay}
                onChange={(e) => onFormChange({ loadingBay: e.target.value })}
              />
            </div>
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
              className="bg-[#0B1F3A] hover:bg-[#16345A]"
            >
              Assign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
