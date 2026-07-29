import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { AnalyticsSummary } from "@/types/analytics";

interface AnalyticsState {
  summary: AnalyticsSummary | null;
  isLoading: boolean;
}

const initialState: AnalyticsState = {
  summary: null,
  isLoading: false,
};

export const useAnalyticsStore = create<AnalyticsState>()(
  devtools(() => initialState, { name: "analytics-store" }),
);
