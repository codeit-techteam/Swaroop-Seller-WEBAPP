"use client";

import { useCallback, useMemo, useState } from "react";

import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  total?: number;
}

export function usePagination({
  initialPage = 1,
  initialPageSize = DEFAULT_PAGE_SIZE,
  total = 0,
}: UsePaginationOptions = {}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize],
  );

  const goToPage = useCallback(
    (nextPage: number) => {
      setPage(Math.min(Math.max(1, nextPage), totalPages));
    },
    [totalPages],
  );

  const nextPage = useCallback(() => {
    goToPage(page + 1);
  }, [goToPage, page]);

  const prevPage = useCallback(() => {
    goToPage(page - 1);
  }, [goToPage, page]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  return {
    page,
    pageSize,
    totalPages,
    setPage: goToPage,
    setPageSize,
    nextPage,
    prevPage,
    reset,
    offset: (page - 1) * pageSize,
  };
}
