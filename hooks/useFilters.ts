"use client";

import { useCallback, useState } from "react";

import type { FilterState } from "@/types/common";

const defaultFilters: FilterState = {
  search: "",
  status: "",
  dateFrom: "",
  dateTo: "",
};

export function useFilters(initialFilters: Partial<FilterState> = {}) {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
  });

  const setFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters({ ...defaultFilters, ...initialFilters });
  }, [initialFilters]);

  return { filters, setFilter, setFilters, resetFilters };
}
