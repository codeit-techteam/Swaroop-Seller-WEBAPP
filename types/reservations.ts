export type ReservationStatus = "ACTIVE" | "RELEASED" | "CONSUMED" | "EXPIRED";

export interface InventoryReservation {
  id: string;
  reservationId: string;
  product: string;
  warehouse: string;
  quantityMt: number;
  orderId: string;
  status: ReservationStatus;
  reservedUntil: string;
}
