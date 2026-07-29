import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface SearchState {
  query: string;
  recentSearches: string[];
  isLoading: boolean;
}

const initialState: SearchState = {
  query: "",
  recentSearches: [],
  isLoading: false,
};

export const useSearchStore = create<SearchState>()(
  devtools(() => initialState, { name: "search-store" }),
);
