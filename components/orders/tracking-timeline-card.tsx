"use client";

import { MapPin, PackageCheck, Truck } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Order } from "@/types/orders";

interface TrackingTimelineCardProps {
  order: Order;
  className?: string;
}

export function TrackingTimelineCard({
  order,
  className,
}: TrackingTimelineCardProps) {
  const events = order.trackingEvents;

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <Truck className="h-4 w-4 text-[#1B6EF3]" />
        <h3 className="text-sm font-bold text-slate-900">Shipment Tracking</h3>
      </div>

      {order.transport?.currentLocation ? (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-600">
              Current Location
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {order.transport.currentLocation}
            </p>
            {order.transport.vehicleNumber &&
            order.transport.vehicleNumber !== "Waiting..." ? (
              <p className="mt-0.5 text-xs text-slate-500">
                {order.transport.carrier} · {order.transport.vehicleNumber}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {events.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500">
          <Truck className="h-4 w-4" />
          Tracking starts after dispatch
        </div>
      ) : (
        <ol className="relative space-y-4 border-l border-slate-200 pl-4">
          {events.map((event) => (
            <li key={event.id} className="relative">
              <span
                className={cn(
                  "absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white",
                  event.status === "completed" && "bg-emerald-500",
                  event.status === "current" && "bg-[#1B6EF3]",
                  event.status === "pending" && "bg-slate-300",
                )}
              />
              <p className="text-sm font-semibold text-slate-800">
                {event.label}
              </p>
              <p className="text-xs text-slate-500">
                {event.location} ·{" "}
                {new Date(event.timestamp).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {event.note ? (
                <p className="mt-1 text-xs text-amber-700">{event.note}</p>
              ) : null}
            </li>
          ))}
        </ol>
      )}

      {order.proofOfDelivery ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
          <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              Proof of Delivery
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {order.proofOfDelivery.receiverName}
            </p>
            <p className="text-xs text-slate-600">
              {new Date(order.proofOfDelivery.receivedAt).toLocaleString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )}
              {order.proofOfDelivery.otpVerified ? " · OTP verified" : ""}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
