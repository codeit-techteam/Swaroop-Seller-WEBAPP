import type { UserRole } from "./roles";
import { CURRENT_MOCK_ROLE, ROLE_LABELS } from "./roles";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  company: string;
  role: UserRole;
  roleLabel: string;
  lastActive: string;
  sellerId?: string;
  mobile?: string;
}

/** Shared demo identity with Customer panels: 8240890242 / OTP 123456 / Karan Veer */
export const CURRENT_USER: SessionUser = {
  id: "usr-seller-001",
  name: "Karan Veer",
  email: "seller@test.local",
  company: "Karan Veer Trading",
  role: CURRENT_MOCK_ROLE,
  roleLabel: ROLE_LABELS[CURRENT_MOCK_ROLE],
  lastActive: "Just now",
  sellerId: "sel-001",
  mobile: "8240890242",
};
