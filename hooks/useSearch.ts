"use client";

import { useCallback, useState } from "react";

export function useSearch(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);

  const clearSearch = useCallback(() => {
    setQuery("");
  }, []);

  return { query, setQuery, clearSearch };
}
