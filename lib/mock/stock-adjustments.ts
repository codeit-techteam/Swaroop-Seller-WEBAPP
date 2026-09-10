import type { StockAdjustment } from "@/types/seller";

export const stockAdjustmentsMock: StockAdjustment[] = [
  {
    id: "adj-pet-1",
    productId: "prod-pet-bottle",
    delta: -48,
    reason: "Dispatch Release",
    at: "2026-09-08T07:20:00.000Z",
  },
  {
    id: "adj-lldpe-1",
    productId: "prod-lldpe-chennai",
    delta: -40,
    reason: "Dispatch Release",
    at: "2026-09-07T11:10:00.000Z",
  },
  {
    id: "adj-pvc-1",
    productId: "prod-pvc-hs1000r",
    delta: 120,
    reason: "New Procurement",
    at: "2026-09-06T06:40:00.000Z",
  },
  {
    id: "adj-p400s-1",
    productId: "prod-pp-p400s",
    delta: -30,
    reason: "Dispatch Release",
    at: "2026-09-05T14:05:00.000Z",
  },
  {
    id: "adj-ppf03-1",
    productId: "prod-pp-ppf03",
    delta: 40,
    reason: "New Procurement",
    at: "2026-09-04T09:15:00.000Z",
  },
  {
    id: "adj-blow-1",
    productId: "prod-hdpe-blow",
    delta: -18,
    reason: "Physical Count",
    at: "2026-09-03T16:30:00.000Z",
  },
  {
    id: "adj-ldpe-1",
    productId: "prod-ldpe-grade",
    delta: 25,
    reason: "Inventory Adjustment",
    at: "2026-09-02T08:50:00.000Z",
  },
  {
    id: "adj-h110-1",
    productId: "prod-pp-h110ma",
    delta: 60,
    reason: "New Procurement",
    at: "2026-08-28T10:00:00.000Z",
  },
  {
    id: "adj-pe100-1",
    productId: "prod-hdpe-pe100",
    delta: -22,
    reason: "Dispatch Release",
    at: "2026-08-26T13:45:00.000Z",
  },
];
