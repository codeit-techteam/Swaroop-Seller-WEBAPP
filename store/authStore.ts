import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CURRENT_USER, ROLE_LABELS } from "@/config";
import { storage, STORAGE_KEYS } from "@/lib/utils";
import type { AuthState, AuthTokens, User } from "@/types/auth";

const sessionUser: User = {
  id: CURRENT_USER.id,
  email: CURRENT_USER.email,
  name: CURRENT_USER.name,
  role: CURRENT_USER.role,
  company: CURRENT_USER.company,
  sellerId: CURRENT_USER.sellerId,
};

interface AuthActions {
  setSession: (user: User, tokens?: AuthTokens | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    (set) => ({
      user: sessionUser,
      tokens: null,
      isAuthenticated: true,
      isLoading: false,
      setSession: (user, tokens = null) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        }),
      logout: () => {
        storage.remove(STORAGE_KEYS.AUTH_TOKEN);
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    { name: "auth-store" },
  ),
);

export { ROLE_LABELS };
