import type {
  Order,
  OrderStatus,
  StatusUpdateValue,
  TrackingEvent,
} from "@/types/orders";
import {
  isPaymentClearedForDispatch,
  STATUS_UPDATE_OPTIONS,
} from "@/types/orders";

export function allowedStatusUpdates(order: Order): StatusUpdateValue[] {
  const map: Record<OrderStatus, StatusUpdateValue[]> = {
    new: [],
    accepted: ["processing"],
    processing: ["qc_complete", "ready"],
    delayed: ["qc_complete", "ready", "in_transit"],
    dispatch_ready: ["loading", "dispatched"],
    in_transit: ["delivered"],
    delivered: [],
    cancelled: [],
  };

  let options = map[order.status] ?? [];

  if (
    !isPaymentClearedForDispatch(order) &&
    order.paymentTerm === "advance"
  ) {
    options = options.filter((value) => {
      const mapsTo = STATUS_UPDATE_OPTIONS.find((o) => o.value === value)?.mapsTo;
      return mapsTo === "processing";
    });
  }

  return options;
}

export function buildTrackingOnDispatch(
  order: Order,
  now: string,
): TrackingEvent[] {
  return [
    {
      id: `trk-${order.id}-dispatch`,
      label: "Dispatched from warehouse",
      location: order.warehouseLabel,
      timestamp: now,
      status: "completed",
    },
    {
      id: `trk-${order.id}-enroute`,
      label: "In transit",
      location: order.transport?.currentLocation ?? "En route",
      timestamp: now,
      status: "current",
      note: order.transport
        ? `${order.transport.carrier} · ${order.transport.vehicleNumber}`
        : undefined,
    },
  ];
}
