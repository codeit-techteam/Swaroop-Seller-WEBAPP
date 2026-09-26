"use client";

import { useMemo, useState } from "react";

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
import {
  useEligibleDispatches,
  useLoadingBays,
  useLogisticsDrivers,
  useLogisticsVehicles,
  useLogisticsWarehouses,
  useVehicleSlotAvailability,
} from "@/hooks/use-vehicle-slots";
import type {
  BookVehicleSlotPayload,
  EligibleDispatch,
  LogisticsVehicle,
  LogisticsVehicleType,
} from "@/types/vehicle-slots";
import { LOGISTICS_VEHICLE_TYPES } from "@/types/vehicle-slots";

export type BookSlotFormState = {
  dispatchId: string;
  warehouseId: string;
  quantityMt: number;
  vehicleType: LogisticsVehicleType | "";
  vehicleId: string;
  driverId: string;
  slotDate: string;
  loadingBay: string;
  timeSlot: string;
};

function todayIsoLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const emptyBookSlotForm = (): BookSlotFormState => ({
  dispatchId: "",
  warehouseId: "",
  quantityMt: 0,
  vehicleType: "",
  vehicleId: "",
  driverId: "",
  slotDate: todayIsoLocal(),
  loadingBay: "",
  timeSlot: "",
});

function formFromOpen(initialDispatchId?: string): BookSlotFormState {
  return {
    ...emptyBookSlotForm(),
    dispatchId: initialDispatchId ?? "",
  };
}

export function BookVehicleSlotModal({
  open,
  busy,
  initialDispatchId,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  busy?: boolean;
  initialDispatchId?: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: BookVehicleSlotPayload) => Promise<void> | void;
}) {
  const [form, setForm] = useState<BookSlotFormState>(() =>
    formFromOpen(initialDispatchId),
  );
  const [dispatchSearch, setDispatchSearch] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [formEpoch, setFormEpoch] = useState(0);

  const dialogKey = `${open ? "open" : "closed"}-${initialDispatchId ?? ""}-${formEpoch}`;

  const dispatchesQuery = useEligibleDispatches(dispatchSearch, open);
  const warehousesQuery = useLogisticsWarehouses();
  const baysQuery = useLoadingBays(
    form.warehouseId,
    open && Boolean(form.warehouseId),
  );
  const vehiclesQuery = useLogisticsVehicles(
    form.vehicleType || undefined,
    open,
  );
  const driversQuery = useLogisticsDrivers(open);
  const availabilityQuery = useVehicleSlotAvailability(
    {
      warehouseId: form.warehouseId,
      date: form.slotDate,
      loadingBayId: form.loadingBay || undefined,
      vehicleId: form.vehicleId || undefined,
      vehicleType: form.vehicleType || undefined,
    },
    open && Boolean(form.warehouseId) && Boolean(form.slotDate),
  );

  const selectedDispatch = useMemo(
    () =>
      (dispatchesQuery.data ?? []).find((d) => d.id === form.dispatchId) ??
      null,
    [dispatchesQuery.data, form.dispatchId],
  );

  const selectedVehicle = useMemo(
    () =>
      (vehiclesQuery.data ?? []).find((v) => v.id === form.vehicleId) ?? null,
    [vehiclesQuery.data, form.vehicleId],
  );

  const selectedDriver = useMemo(
    () => (driversQuery.data ?? []).find((d) => d.id === form.driverId) ?? null,
    [driversQuery.data, form.driverId],
  );

  const remainingQty = Number(selectedDispatch?.quantity ?? 0);
  const windows = availabilityQuery.data?.windows ?? [];

  const canSubmit =
    Boolean(form.dispatchId) &&
    Boolean(form.warehouseId) &&
    Boolean(form.vehicleId) &&
    Boolean(form.driverId) &&
    Boolean(form.slotDate) &&
    Boolean(form.loadingBay) &&
    Boolean(form.timeSlot) &&
    form.quantityMt > 0 &&
    form.quantityMt <= remainingQty;

  const applyDispatch = (
    dispatch: EligibleDispatch | undefined,
    dispatchId: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      dispatchId,
      quantityMt: dispatch ? Number(dispatch.quantity) || 0 : prev.quantityMt,
      warehouseId: dispatch?.originWarehouseId || prev.warehouseId,
    }));
  };

  const applyVehicle = (
    vehicle: LogisticsVehicle | undefined,
    vehicleId: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      vehicleId,
      timeSlot: "",
      driverId: vehicle?.driverId || prev.driverId,
    }));
  };

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setForm(formFromOpen(initialDispatchId));
      setDispatchSearch("");
      setLocalError(null);
      setFormEpoch((n) => n + 1);
    }
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    setLocalError(null);
    if (!canSubmit) {
      setLocalError("Please complete all required booking fields.");
      return;
    }
    if (form.quantityMt > remainingQty) {
      setLocalError("Quantity cannot exceed remaining dispatch quantity.");
      return;
    }
    const window = windows.find((w) => w.timeSlot === form.timeSlot);
    await onSubmit({
      dispatchId: form.dispatchId,
      warehouseId: form.warehouseId,
      vehicleId: form.vehicleId,
      driverId: form.driverId,
      slotDate: form.slotDate,
      timeSlot: form.timeSlot,
      loadingBay: form.loadingBay,
      quantityMt: form.quantityMt,
      startTime: window?.startTime,
      endTime: window?.endTime,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        key={dialogKey}
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>Book vehicle slot</DialogTitle>
          <DialogDescription>
            Select an eligible dispatch, then assign warehouse, vehicle, driver,
            loading bay and an available time window.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Order
            </h3>
            <div className="space-y-1.5">
              <Label>Dispatch / Order</Label>
              <Input
                placeholder="Search dispatch or PO reference"
                value={dispatchSearch}
                onChange={(e) => setDispatchSearch(e.target.value)}
                className="mb-2"
              />
              <Select
                value={form.dispatchId || undefined}
                onValueChange={(dispatchId) => {
                  const dispatch = (dispatchesQuery.data ?? []).find(
                    (item) => item.id === dispatchId,
                  );
                  applyDispatch(dispatch, dispatchId);
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      dispatchesQuery.isLoading
                        ? "Loading eligible dispatches…"
                        : "Select eligible dispatch"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(dispatchesQuery.data ?? []).map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.dispatchNumber}
                      {item.purchaseOrderReference
                        ? ` · ${item.purchaseOrderReference}`
                        : ""}{" "}
                      · {item.quantity} {item.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {dispatchesQuery.isSuccess &&
              (dispatchesQuery.data?.length ?? 0) === 0 ? (
                <p className="text-xs text-slate-500">
                  No orders are currently eligible for vehicle slot booking.
                </p>
              ) : null}
              {selectedDispatch ? (
                <p className="text-xs text-slate-500">
                  Remaining quantity: {selectedDispatch.quantity}{" "}
                  {selectedDispatch.unit}
                  {selectedDispatch.destinationRegion
                    ? ` · Destination: ${selectedDispatch.destinationRegion}`
                    : ""}
                  {" · "}
                  {selectedDispatch.buyer.displayName}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qty">Dispatch Quantity (MT)</Label>
              <Input
                id="qty"
                type="number"
                min="0.001"
                step="0.001"
                value={form.quantityMt || ""}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    quantityMt: Number(event.target.value),
                  }))
                }
              />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Location
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Warehouse</Label>
                <Select
                  value={form.warehouseId || undefined}
                  onValueChange={(warehouseId) =>
                    setForm((prev) => ({
                      ...prev,
                      warehouseId,
                      loadingBay: "",
                      timeSlot: "",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        warehousesQuery.isLoading
                          ? "Loading warehouses…"
                          : "Select warehouse"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(warehousesQuery.data ?? []).map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                        {item.city ? ` · ${item.city}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Loading Bay</Label>
                <Select
                  value={form.loadingBay || undefined}
                  onValueChange={(loadingBay) =>
                    setForm((prev) => ({
                      ...prev,
                      loadingBay,
                      timeSlot: "",
                    }))
                  }
                  disabled={!form.warehouseId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        baysQuery.isLoading
                          ? "Loading bays…"
                          : "Select loading bay"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(baysQuery.data ?? []).map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Vehicle
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Vehicle Type</Label>
                <Select
                  value={form.vehicleType || undefined}
                  onValueChange={(vehicleType) =>
                    setForm((prev) => ({
                      ...prev,
                      vehicleType: vehicleType as LogisticsVehicleType,
                      vehicleId: "",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOGISTICS_VEHICLE_TYPES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Vehicle Number</Label>
                <Select
                  value={form.vehicleId || undefined}
                  onValueChange={(vehicleId) => {
                    const vehicle = (vehiclesQuery.data ?? []).find(
                      (item) => item.id === vehicleId,
                    );
                    applyVehicle(vehicle, vehicleId);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        vehiclesQuery.isLoading
                          ? "Loading vehicles…"
                          : "Select vehicle"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(vehiclesQuery.data ?? []).map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.numberPlate} · {item.type}
                        {item.capacityMt ? ` · ${item.capacityMt} MT` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Carrier</Label>
                <Input
                  value={selectedVehicle?.transporterName ?? ""}
                  readOnly
                  placeholder="Assigned from selected vehicle"
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Driver
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Driver</Label>
                <Select
                  value={form.driverId || undefined}
                  onValueChange={(driverId) =>
                    setForm((prev) => ({ ...prev, driverId }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        driversQuery.isLoading
                          ? "Loading drivers…"
                          : "Select driver"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(driversQuery.data ?? []).map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                        {item.phone ? ` · ${item.phone}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Driver Phone</Label>
                <Input
                  value={selectedDriver?.phone ?? ""}
                  readOnly
                  placeholder="From driver record"
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Schedule
            </h3>
            <div className="space-y-1.5">
              <Label htmlFor="date">Preferred Date</Label>
              <Input
                id="date"
                type="date"
                value={form.slotDate}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    slotDate: event.target.value,
                    timeSlot: "",
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Preferred Time Slot</Label>
              {availabilityQuery.isLoading ? (
                <p className="text-sm text-slate-500">Checking availability…</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {windows.map((item) => {
                    const bayState = form.loadingBay
                      ? item.bays.find((b) => b.loadingBay === form.loadingBay)
                      : null;
                    const availability =
                      bayState?.availability ?? item.availability;
                    const disabled =
                      availability !== "AVAILABLE" || !form.loadingBay;
                    return (
                      <button
                        key={item.timeSlot}
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            timeSlot: item.timeSlot,
                          }))
                        }
                        className={`rounded-lg border px-3 py-2 text-left text-xs ${
                          form.timeSlot === item.timeSlot
                            ? "border-[#1B6EF3] bg-[#E8F1FF]"
                            : "border-slate-200"
                        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                      >
                        <p className="font-medium">{item.timeSlot}</p>
                        <div className="mt-1">
                          <SellerStatusBadge status={availability} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {!form.loadingBay ? (
                <p className="text-xs text-slate-500">
                  Select a loading bay to enable time slots.
                </p>
              ) : null}
            </div>
          </section>

          {localError ? (
            <p className="text-sm text-red-600">{localError}</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-[#0B1F3A] hover:bg-[#122846]"
            disabled={busy || !canSubmit}
            onClick={() => void handleSubmit()}
          >
            {busy ? "Booking..." : "Confirm Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
