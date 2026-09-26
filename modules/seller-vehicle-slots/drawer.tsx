"use client";

import { DetailDrawer } from "@/components/drawers/detail-drawer";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Button } from "@/components/ui/button";
import { formatMt } from "@/lib/seller/format";
import { formatDate } from "@/lib/utils";
import type { SellerVehicleSlot } from "@/types/vehicle-slots";

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-slate-900">
        {value || "—"}
      </p>
    </div>
  );
}

function canCancel(status: string) {
  return (
    status !== "CANCELLED" &&
    status !== "COMPLETED" &&
    status !== "LOADING" &&
    status !== "CHECKED_IN" &&
    status !== "MISSED" &&
    status !== "NO_SHOW"
  );
}

export function VehicleSlotDrawer({
  slot,
  busy,
  onOpenChange,
  onCancel,
}: {
  slot: SellerVehicleSlot | null;
  busy?: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
}) {
  const active = slot ? canCancel(slot.status) : false;

  return (
    <DetailDrawer
      open={Boolean(slot)}
      onOpenChange={onOpenChange}
      title={slot?.slotNumber ?? "Vehicle slot"}
      description={
        slot?.purchaseOrderReference ?? slot?.dispatchNumber ?? undefined
      }
      className="sm:max-w-xl"
    >
      {slot ? (
        <div className="space-y-6">
          <SellerStatusBadge status={slot.status} />
          <section className="grid grid-cols-2 gap-3 rounded-lg border p-3">
            <Field label="Slot ID" value={slot.slotNumber} />
            <Field
              label="Order / PO"
              value={slot.purchaseOrderReference || slot.orderId}
            />
            <Field label="Dispatch" value={slot.dispatchNumber} />
            <Field label="Shipment" value={slot.shipmentNumber} />
            <Field label="Warehouse" value={slot.warehouseName} />
            <Field
              label="Quantity"
              value={formatMt(Number(slot.quantityMt ?? 0))}
            />
            <Field
              label="Buyer"
              value={slot.buyer?.displayName ?? "Anonymous Buyer"}
            />
            <Field label="Destination" value={slot.destinationRegion} />
          </section>
          <section className="grid grid-cols-2 gap-3 rounded-lg border p-3">
            <Field label="Vehicle Number" value={slot.vehicleNumber} />
            <Field label="Vehicle Type" value={slot.vehicleType} />
            <Field label="Carrier" value={slot.carrier} />
            <Field label="Driver" value={slot.driverName} />
            <Field label="Driver Phone" value={slot.driverPhone} />
          </section>
          <section className="grid grid-cols-2 gap-3 rounded-lg border p-3">
            <Field
              label="Scheduled Date"
              value={slot.slotDate ? formatDate(slot.slotDate) : null}
            />
            <Field label="Time Slot" value={slot.timeSlot} />
            <Field label="Loading Bay" value={slot.loadingBay} />
            <Field
              label="Created"
              value={slot.createdAt ? formatDate(slot.createdAt) : null}
            />
            <Field
              label="Updated"
              value={slot.updatedAt ? formatDate(slot.updatedAt) : null}
            />
          </section>
          {active ? (
            <Button
              variant="outline"
              className="w-full text-red-600"
              disabled={busy}
              onClick={onCancel}
            >
              Cancel Slot
            </Button>
          ) : null}
        </div>
      ) : null}
    </DetailDrawer>
  );
}
