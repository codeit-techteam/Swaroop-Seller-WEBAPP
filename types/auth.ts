import type { UserRole } from "@/config/roles";

export type { UserRole };

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  company?: string;
  sellerId?: string | null;
  sellerName?: string | null;
  loginId?: string | null;
  permissions?: string[];
  mustChangePassword?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
