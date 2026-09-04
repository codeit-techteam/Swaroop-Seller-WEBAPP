"use client";

import Link from "next/link";

import { DetailDrawer } from "@/components/drawers/detail-drawer";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Timeline } from "@/components/status/timeline";
import { ROUTES } from "@/lib/constants";
import { formatMt } from "@/lib/seller/format";
import { timelineForShipment } from "@/lib/seller/shipment-timeline";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { SellerShipment } from "@/types/seller";

interface ShipmentDetailDrawerProps {
  shipment: SellerShipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShipmentDetailDrawer({
  shipment,
  open,
  onOpenChange,
}: ShipmentDetailDrawerProps) {
  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Shipment Details"
    >
      {shipment ? (
        <div className="space-y-5 text-sm">
          <dl className="grid grid-cols-2 gap-3">
            <Field label="Shipment ID" value={shipment.id} />
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Order ID
              </dt>
              <dd className="mt-0.5 font-medium">
                <Link
                  href={`${ROUTES.ORDERS}/${shipment.orderId}`}
                  className="text-[#1B6EF3] hover:underline"
                >
                  {shipment.orderId}
                </Link>
              </dd>
            </div>
            <Field label="Grade" value={shipment.grade} />
            <Field label="Quantity" value={`${formatMt(shipment.quantity)}`} />
            <Field label="Vehicle Number" value={shipment.vehicleNumber} />
            <Field label="Origin" value={shipment.origin} />
            <Field label="Destination" value={shipment.destination} />
            <Field
              label="Dispatch Date"
              value={
                shipment.dispatchDate
                  ? formatDate(shipment.dispatchDate, "dd/MM/yyyy")
                  : "—"
              }
            />
            <Field
              label="ETA"
              value={formatDateTime(shipment.eta, "dd/MM/yyyy, h:mm a")}
            />
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Current Status
              </dt>
              <dd className="mt-1">
                <SellerStatusBadge status={shipment.status} />
              </dd>
            </div>
          </dl>

          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Tracking is based on dispatch milestones. Live GPS is not available.
          </p>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Shipment Timeline
            </h3>
            <Timeline steps={timelineForShipment(shipment)} />
          </div>
        </div>
      ) : null}
    </DetailDrawer>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium text-slate-800">{value}</dd>
    </div>
  );
}
