export type KycRecordStatus =
  | "VERIFIED"
  | "PENDING"
  | "EXPIRED"
  | "REJECTED"
  | "UNDER_REVIEW";

export interface KycRecord {
  id: string;
  entity: string;
  entityType: "BUYER" | "SELLER" | "USER";
  document: string;
  status: KycRecordStatus;
  submittedAt: string;
  expiresAt: string;
  reviewer: string;
}
