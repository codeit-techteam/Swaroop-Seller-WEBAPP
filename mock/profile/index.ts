import { ROLE_PERMISSIONS } from "@/config/permissions";
import type { AdminProfile } from "@/types/profile";

export const adminProfileMock: AdminProfile = {
  id: "usr-ops-001",
  name: "Amit Shah",
  email: "amit.shah@petrotrade.in",
  phone: "+91 98765 43210",
  initials: "AS",
  role: "ADMIN",
  department: "Platform Operations",
  employeeId: "PT-ADM-001",
  officeLocation: "Mumbai, MH",
  joinedAt: "Jan 2022",
  status: "active",
  lastLoginAt: "2026-08-21T12:45:00+05:30",
  permissions: ROLE_PERMISSIONS.ADMIN,
  lastUpdatedAt: "2026-08-18T14:32:00+05:30",
  lastUpdatedBy: "amit.shah",
};

/** @deprecated Use adminProfileMock */
export const sellerProfileMock = adminProfileMock;
