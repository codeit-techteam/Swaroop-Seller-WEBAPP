import type { InventoryReservation } from "@/types/reservations";

export const inventoryReservationsMock: InventoryReservation[] = [
  {
    id: "res-1",
    reservationId: "RSV-2201",
    product: "PP H110MA",
    warehouse: "Mundra",
    quantityMt: 120,
    orderId: "PC-98231",
    status: "ACTIVE",
    reservedUntil: "2024-05-18",
  },
  {
    id: "res-2",
    reservationId: "RSV-2194",
    product: "HDPE Blow Grade",
    warehouse: "Hazira",
    quantityMt: 90,
    orderId: "PC-98280",
    status: "CONSUMED",
    reservedUntil: "2024-05-14",
  },
  {
    id: "res-3",
    reservationId: "RSV-2188",
    product: "LDPE 2420H",
    warehouse: "Jamnagar",
    quantityMt: 40,
    orderId: "PC-98271",
    status: "RELEASED",
    reservedUntil: "2024-05-16",
  },
  {
    id: "res-4",
    reservationId: "RSV-2170",
    product: "PVC Resin SG5",
    warehouse: "Dahej",
    quantityMt: 25,
    orderId: "PC-98288",
    status: "EXPIRED",
    reservedUntil: "2024-05-10",
  },
];
