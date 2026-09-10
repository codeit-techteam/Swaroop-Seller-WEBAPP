"use client";

import { DetailDrawer } from "@/components/drawers/detail-drawer";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Button } from "@/components/ui/button";
import { formatMt } from "@/lib/seller/format";
import { formatDate } from "@/lib/utils";
import type { VehicleSlot } from "@/types/seller-ops";

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900">{value || "—"}</p>
    </div>
  );
}

export function VehicleSlotDrawer({
  slot,
  busy,
  onOpenChange,
  onReschedule,
  onCancel,
  onArrive,
  onLoadingStart,
  onLoadingComplete,
}: {
  slot: VehicleSlot | null;
  busy?: boolean;
  onOpenChange: (open: boolean) => void;
  onReschedule: () => void;
  onCancel: () => void;
  onArrive: () => void;
  onLoadingStart: () => void;
  onLoadingComplete: () => void;
}) {
  const active = slot && slot.status !== "CANCELLED" && slot.status !== "COMPLETED";

  return (
    <DetailDrawer
      open={Boolean(slot)}
      onOpenChange={onOpenChange}
      title={slot?.id ?? "Vehicle slot"}
      description={slot?.orderId}
      className="sm:max-w-xl"
    >
      {slot ? (
        <div className="space-y-6">
          <SellerStatusBadge status={slot.status} />
          <section className="grid grid-cols-2 gap-3 rounded-lg border p-3">
            <Field label="Slot ID" value={slot.id} />
            <Field label="Order ID" value={slot.orderId} />
            <Field label="Warehouse" value={slot.warehouseName} />
            <Field label="Quantity" value={formatMt(slot.quantityMt)} />
          </section>
          <section className="grid grid-cols-2 gap-3 rounded-lg border p-3">
            <Field label="Vehicle Number" value={slot.vehicleNumber} />
            <Field label="Vehicle Type" value={slot.vehicleType} />
            <Field label="Carrier" value={slot.carrier} />
            <Field label="Driver" value={slot.driverName} />
            <Field label="Driver Phone" value={slot.driverPhone} />
          </section>
          <section className="grid grid-cols-2 gap-3 rounded-lg border p-3">
            <Field label="Scheduled Date" value={formatDate(slot.date)} />
            <Field label="Time Slot" value={slot.timeSlot} />
            <Field label="Loading Bay" value={slot.loadingBay} />
            <Field label="Notes" value={slot.notes} />
          </section>
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Documents
            </h3>
            {slot.documents.length === 0 ? (
              <p className="text-sm text-slate-500">No documents attached yet.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {slot.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between">
                    <span>{doc.kind}</span>
                    <SellerStatusBadge
                      status={doc.available ? "COMPLETED" : "MISSING"}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Timeline
            </h3>
            <ol className="space-y-2">
              {slot.timeline.map((step) => (
                <li key={step.id} className="flex items-start gap-2 text-sm">
                  <span
                    className={
                      step.status === "completed"
                        ? "mt-1 h-2 w-2 rounded-full bg-emerald-500"
                        : step.status === "current"
                          ? "mt-1 h-2 w-2 rounded-full bg-[#1B6EF3]"
                          : "mt-1 h-2 w-2 rounded-full bg-slate-300"
                    }
                  />
                  <div>
                    <p className="font-medium text-slate-800">{step.label}</p>
                    {step.at ? (
                      <p className="text-xs text-slate-400">{formatDate(step.at)}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
          {active ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="outline" disabled={busy} onClick={onReschedule}>
                Reschedule
              </Button>
              <Button
                variant="outline"
                className="text-red-600"
                disabled={busy}
                onClick={onCancel}
              >
                Cancel Slot
              </Button>
              {slot.status === "BOOKED" ? (
                <Button
                  className="bg-[#0B1F3A] hover:bg-[#122846] sm:col-span-2"
                  disabled={busy}
                  onClick={onArrive}
                >
                  Mark Vehicle Arrived
                </Button>
              ) : null}
              {slot.status === "ARRIVED" ? (
                <Button
                  className="bg-[#0B1F3A] hover:bg-[#122846] sm:col-span-2"
                  disabled={busy}
                  onClick={onLoadingStart}
                >
                  Mark Loading Started
                </Button>
              ) : null}
              {slot.status === "LOADING" ? (
                <Button
                  className="bg-[#0B1F3A] hover:bg-[#122846] sm:col-span-2"
                  disabled={busy}
                  onClick={onLoadingComplete}
                >
                  Mark Loading Completed
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </DetailDrawer>
  );
}
