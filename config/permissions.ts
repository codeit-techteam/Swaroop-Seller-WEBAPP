import type { UserRole } from "./roles";

export type Permission =
  | "dashboard.view"
  | "inventory.view"
  | "inventory.manage"
  | "offers.view"
  | "offers.manage"
  | "offers.review"
  | "procurement.view"
  | "procurement.manage"
  | "orders.view"
  | "orders.manage"
  | "logistics.view"
  | "logistics.manage"
  | "finance.view"
  | "finance.manage"
  | "compliance.view"
  | "compliance.manage"
  | "analytics.view"
  | "reports.view"
  | "users.view"
  | "users.manage"
  | "profile.view";

const ALL_PERMISSIONS: Permission[] = [
  "dashboard.view",
  "inventory.view",
  "inventory.manage",
  "offers.view",
  "offers.manage",
  "offers.review",
  "procurement.view",
  "procurement.manage",
  "orders.view",
  "orders.manage",
  "logistics.view",
  "logistics.manage",
  "finance.view",
  "finance.manage",
  "compliance.view",
  "compliance.manage",
  "analytics.view",
  "reports.view",
  "users.view",
  "users.manage",
  "profile.view",
];

const VIEW_ONLY: Permission[] = ALL_PERMISSIONS.filter((permission) =>
  permission.endsWith(".view"),
);

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: ALL_PERMISSIONS,
  OPERATIONS: ALL_PERMISSIONS.filter(
    (permission) => !permission.startsWith("users."),
  ),
  PROCUREMENT: [
    "dashboard.view",
    "inventory.view",
    "offers.view",
    "offers.manage",
    "offers.review",
    "procurement.view",
    "procurement.manage",
    "orders.view",
    "analytics.view",
    "profile.view",
  ],
  FINANCE: [
    "dashboard.view",
    "orders.view",
    "finance.view",
    "finance.manage",
    "analytics.view",
    "reports.view",
    "profile.view",
  ],
  LOGISTICS: [
    "dashboard.view",
    "inventory.view",
    "orders.view",
    "logistics.view",
    "logistics.manage",
    "profile.view",
  ],
  COMPLIANCE: [
    "dashboard.view",
    "offers.review",
    "compliance.view",
    "compliance.manage",
    "profile.view",
  ],
  VIEWER: VIEW_ONLY,
  SELLER: [
    "dashboard.view",
    "inventory.view",
    "offers.view",
    "procurement.view",
    "procurement.manage",
    "orders.view",
    "logistics.view",
    "compliance.view",
    "profile.view",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canAccess(role: UserRole, permission?: Permission): boolean {
  if (!permission) return true;
  return hasPermission(role, permission);
}
