import type {
  SellerShipment,
  ShipmentStatus,
  TimelineStep,
} from "@/types/seller";

export const SHIPMENT_TIMELINE_LABELS = [
  "Order Confirmed",
  "Vehicle Assigned",
  "Loading Completed",
  "Dispatched",
  "In Transit",
  "Delivered",
] as const;

const CURRENT_INDEX: Record<ShipmentStatus, number> = {
  LOADING: 2,
  DISPATCHED: 3,
  IN_TRANSIT: 4,
  DELIVERED: 5,
  CANCELLED: -1,
};

export function isInTransitTab(status: ShipmentStatus): boolean {
  return (
    status === "IN_TRANSIT" || status === "LOADING" || status === "DISPATCHED"
  );
}

export function buildShipmentTimeline(
  status: ShipmentStatus,
  timestamps?: Partial<
    Record<(typeof SHIPMENT_TIMELINE_LABELS)[number], string>
  >,
): TimelineStep[] {
  const current = CURRENT_INDEX[status];

  return SHIPMENT_TIMELINE_LABELS.map((label, index) => {
    let stepStatus: TimelineStep["status"] = "pending";
    if (status === "DELIVERED" || (current >= 0 && index < current)) {
      stepStatus = "completed";
    } else if (index === current) {
      stepStatus = "current";
    }

    return {
      id: `tl-${index}-${label}`,
      label,
      status: stepStatus,
      at: stepStatus === "pending" ? undefined : timestamps?.[label],
    };
  });
}

export function timelineForShipment(shipment: SellerShipment): TimelineStep[] {
  if (shipment.timeline.length > 0) return shipment.timeline;
  return buildShipmentTimeline(shipment.status, {
    "Order Confirmed": shipment.dispatchDate,
    "Vehicle Assigned": shipment.dispatchDate,
    "Loading Completed": shipment.dispatchDate,
    Dispatched: shipment.dispatchDate,
    "In Transit": shipment.dispatchDate,
    Delivered: shipment.status === "DELIVERED" ? shipment.eta : undefined,
  });
}
