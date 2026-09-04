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

export const CURRENT_USER: SessionUser = {
  id: "usr-seller-001",
  name: "Rajesh Kumar",
  email: "rajesh.kumar@reliance-poly.in",
  company: "Reliance Poly Industries",
  role: CURRENT_MOCK_ROLE,
  roleLabel: ROLE_LABELS[CURRENT_MOCK_ROLE],
  lastActive: "Just now",
  sellerId: "sel-001",
  mobile: "9876543210",
};
