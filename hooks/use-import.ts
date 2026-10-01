"use client";

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  fetchDeal,
  fetchDeals,
  fetchImportConfig,
  fetchImportMaster,
  fetchImportPaymentTerms,
  fetchImportSummary,
  fetchListing,
  fetchListingDocuments,
  fetchListings,
  fetchMatches,
  fetchNegotiation,
  fetchNegotiations,
  type ListingQuery,
} from "@/services/import";
import type { ImportSide } from "@/types/import";

export const importKeys = {
  all: ["import"] as const,
  config: ["import", "config"] as const,
  summary: ["import", "summary"] as const,
  master: ["import", "master"] as const,
  paymentTerms: (currency?: string) =>
    ["import", "payment-terms", currency ?? ""] as const,
  listings: (side: ImportSide, query: ListingQuery) =>
    ["import", "listings", side, query] as const,
  listing: (side: ImportSide, id: string) =>
    ["import", "listing", side, id] as const,
  matches: (side: ImportSide, id: string) =>
    ["import", "matches", side, id] as const,
  documents: (listingId: string) => ["import", "documents", listingId] as const,
  negotiations: (query: object) => ["import", "negotiations", query] as const,
  negotiation: (id: string) => ["import", "negotiation", id] as const,
  deals: (query: object) => ["import", "deals", query] as const,
  deal: (id: string) => ["import", "deal", id] as const,
};

export function useImportConfig() {
  return useQuery({
    queryKey: importKeys.config,
    queryFn: fetchImportConfig,
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });
}

/** Hidden until the backend says Import is enabled (fails closed). */
export function useImportEnabled(): boolean {
  const { data } = useImportConfig();
  return data?.enabled === true;
}

/**
 * `disabled` — the backend has Import but an admin switched it off.
 * `unavailable` — the backend could not be reached or does not serve Import.
 */
export type ImportAvailability =
  "loading" | "enabled" | "disabled" | "unavailable";

export function useImportAvailability() {
  const config = useImportConfig();
  const status: ImportAvailability = config.isLoading
    ? "loading"
    : config.isError
      ? "unavailable"
      : config.data?.enabled === true
        ? "enabled"
        : "disabled";
  return {
    status,
    retry: () => void config.refetch(),
    retrying: config.isFetching,
  };
}

export function useImportSummary() {
  const enabled = useImportEnabled();
  return useQuery({
    queryKey: importKeys.summary,
    queryFn: fetchImportSummary,
    staleTime: 30 * 1000,
    enabled,
  });
}

export function useImportMaster() {
  return useQuery({
    queryKey: importKeys.master,
    queryFn: fetchImportMaster,
    staleTime: 10 * 60 * 1000,
  });
}

export function useImportPaymentTerms(currencyCode?: string | null) {
  return useQuery({
    queryKey: importKeys.paymentTerms(currencyCode ?? undefined),
    queryFn: () => fetchImportPaymentTerms(currencyCode ?? undefined),
    enabled: Boolean(currencyCode),
    staleTime: 10 * 60 * 1000,
  });
}

export function useImportListings(side: ImportSide, query: ListingQuery) {
  return useQuery({
    queryKey: importKeys.listings(side, query),
    queryFn: () => fetchListings(side, query),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });
}

export function useImportListing(side: ImportSide, id: string | null) {
  return useQuery({
    queryKey: importKeys.listing(side, id ?? ""),
    queryFn: () => fetchListing(side, id!),
    enabled: Boolean(id),
    staleTime: 0,
  });
}

export function useImportMatches(side: ImportSide, id: string, enabled = true) {
  return useQuery({
    queryKey: importKeys.matches(side, id),
    queryFn: () => fetchMatches(side, id),
    enabled,
    staleTime: 15 * 1000,
  });
}

export function useImportDocuments(listingId: string, enabled = true) {
  return useQuery({
    queryKey: importKeys.documents(listingId),
    queryFn: () => fetchListingDocuments(listingId),
    enabled,
    retry: 0,
  });
}

export function useImportNegotiations(
  query: Parameters<typeof fetchNegotiations>[0],
) {
  return useQuery({
    queryKey: importKeys.negotiations(query),
    queryFn: () => fetchNegotiations(query),
    placeholderData: keepPreviousData,
    staleTime: 10 * 1000,
  });
}

export function useImportNegotiation(id: string) {
  return useQuery({
    queryKey: importKeys.negotiation(id),
    queryFn: () => fetchNegotiation(id),
    staleTime: 0,
    refetchInterval: 30 * 1000,
  });
}

export function useImportDeals(query: Parameters<typeof fetchDeals>[0]) {
  return useQuery({
    queryKey: importKeys.deals(query),
    queryFn: () => fetchDeals(query),
    placeholderData: keepPreviousData,
    staleTime: 10 * 1000,
  });
}

export function useImportDeal(id: string) {
  return useQuery({
    queryKey: importKeys.deal(id),
    queryFn: () => fetchDeal(id),
    staleTime: 0,
  });
}

export function useInvalidateImport() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: importKeys.all });
}

/**
 * Seconds left until a server-computed deadline, ticking locally from the
 * moment the value was fetched so the client clock is never trusted.
 */
export function useServerCountdown(
  secondsAtFetch: number | null | undefined,
  fetchedAt: number,
): number | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (secondsAtFetch === null || secondsAtFetch === undefined) return;
    const timer = window.setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => window.clearInterval(timer);
  }, [secondsAtFetch]);
  if (secondsAtFetch === null || secondsAtFetch === undefined) return null;
  return Math.max(0, secondsAtFetch - Math.floor((now - fetchedAt) / 1000));
}
