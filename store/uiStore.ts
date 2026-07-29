import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UiState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  globalLoading: boolean;
}

const initialState: UiState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  globalLoading: false,
};

export const useUiStore = create<UiState>()(
  devtools(() => initialState, { name: "ui-store" }),
);
