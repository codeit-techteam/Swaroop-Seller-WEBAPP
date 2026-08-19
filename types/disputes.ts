export type DisputeStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "AWAITING_EVIDENCE"
  | "RESOLVED"
  | "REJECTED";

export type DisputeCategory =
  | "QUALITY"
  | "QUANTITY"
  | "PAYMENT"
  | "LOGISTICS"
  | "DOCUMENTATION";

export interface Dispute {
  id: string;
  disputeId: string;
  orderId: string;
  category: DisputeCategory;
  raisedBy: string;
  amount: number;
  status: DisputeStatus;
  openedAt: string;
  slaHours: number;
}
