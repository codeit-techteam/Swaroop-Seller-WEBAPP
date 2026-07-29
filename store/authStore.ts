import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { AuthState } from "@/types/auth";

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
};

export const useAuthStore = create<AuthState>()(
  devtools(() => initialState, { name: "auth-store" }),
);
