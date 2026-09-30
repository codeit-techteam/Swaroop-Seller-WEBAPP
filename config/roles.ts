export type UserRole =
  | "ADMIN"
  | "OPERATIONS"
  | "PROCUREMENT"
  | "FINANCE"
  | "LOGISTICS"
  | "COMPLIANCE"
  | "VIEWER"
  | "SELLER"
  | "SELLER_MANAGER";

export const USER_ROLES: UserRole[] = [
  "ADMIN",
  "OPERATIONS",
  "PROCUREMENT",
  "FINANCE",
  "LOGISTICS",
  "COMPLIANCE",
  "VIEWER",
  "SELLER",
  "SELLER_MANAGER",
];

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrator",
  OPERATIONS: "Operations Manager",
  PROCUREMENT: "Procurement Manager",
  FINANCE: "Finance Manager",
  LOGISTICS: "Logistics Manager",
  COMPLIANCE: "Compliance Manager",
  VIEWER: "Viewer",
  SELLER: "Seller",
  SELLER_MANAGER: "Seller Manager",
};

export function isSellerRole(role: UserRole): boolean {
  return role === "SELLER" || role === "SELLER_MANAGER";
}

export const CURRENT_MOCK_ROLE: UserRole = "SELLER";
