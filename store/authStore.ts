import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CURRENT_USER, ROLE_LABELS } from "@/config";
import type { AuthState, User } from "@/types/auth";

const sessionUser: User = {
  id: CURRENT_USER.id,
  email: CURRENT_USER.email,
  name: CURRENT_USER.name,
  role: CURRENT_USER.role,
  company: CURRENT_USER.company,
  sellerId: CURRENT_USER.sellerId,
};

export const useAuthStore = create<AuthState>()(
  devtools(
    () => ({
      user: sessionUser,
      tokens: null,
      isAuthenticated: true,
      isLoading: false,
    }),
    { name: "auth-store" },
  ),
);

export { ROLE_LABELS };
