export type UserRole =
  | "ADMIN"
  | "OPERATIONS"
  | "PROCUREMENT"
  | "FINANCE"
  | "LOGISTICS"
  | "COMPLIANCE"
  | "VIEWER"
  | "SELLER";

export const USER_ROLES: UserRole[] = [
  "ADMIN",
  "OPERATIONS",
  "PROCUREMENT",
  "FINANCE",
  "LOGISTICS",
  "COMPLIANCE",
  "VIEWER",
  "SELLER",
];

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "ADMIN PANEL",
  OPERATIONS: "Operations Manager",
  PROCUREMENT: "Procurement Manager",
  FINANCE: "Finance Manager",
  LOGISTICS: "Logistics Manager",
  COMPLIANCE: "Compliance Manager",
  VIEWER: "Viewer",
  SELLER: "Seller / Supplier",
};

export function isSellerRole(role: UserRole): boolean {
  return role === "SELLER";
}

export const CURRENT_MOCK_ROLE: UserRole = "ADMIN";
