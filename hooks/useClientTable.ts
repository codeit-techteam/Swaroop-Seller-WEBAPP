"use client";

import { useMemo, useState } from "react";

interface UseClientTableOptions<T> {
  rows: T[];
  pageSize?: number;
  searchFields: (row: T) => string[];
  getStatus?: (row: T) => string | undefined;
  initialStatus?: string;
}

export function useClientTable<T>({
  rows,
  pageSize = 8,
  searchFields,
  getStatus,
  initialStatus = "ALL",
}: UseClientTableOptions<T>) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(initialStatus || "ALL");
  const [page, setPage] = useState(1);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch =
        !query ||
        searchFields(row).some((field) => field.toLowerCase().includes(query));
      const statusValue = getStatus
        ? getStatus(row)
        : (row as { status?: string }).status;
      const matchesStatus =
        status === "ALL" || !statusValue || statusValue === status;
      return matchesSearch && matchesStatus;
    });
  }, [getStatus, rows, search, searchFields, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  return {
    search,
    setSearch: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    status,
    setStatus: (value: string) => {
      setStatus(value);
      setPage(1);
    },
    page: safePage,
    setPage,
    sortDir,
    toggleSort: () => setSortDir((dir) => (dir === "asc" ? "desc" : "asc")),
    filtered,
    paginated,
    totalPages,
    pageSize,
  };
}
