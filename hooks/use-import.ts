"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { hasPermission, type Permission } from "@/config";
import {
  addShipmentEvent,
  createShipment,
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
  getShipment,
  type ListingQuery,
  listShipments,
  type ShipmentQuery,
  updateShipment,
} from "@/services/import";
import { useAuthStore } from "@/store/authStore";
import type {
  ImportShipmentCreateInput,
  ImportShipmentEventInput,
  ImportShipmentUpdateInput,
  ImportSide,
} from "@/types/import";

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
  shipments: (query: ShipmentQuery) =>
    ["import", "shipments", "list", query] as const,
  shipment: (id: string) => ["import", "shipments", "detail", id] as const,
};

/**
 * Seller owners get every Import permission; Seller Managers only the codes
 * granted to them. The backend enforces the same rule per request.
 */
export function useImportAccess() {
  const user = useAuthStore((s) => s.user);
  const has = (permission: Permission) => {
    if (!user) return false;
    if (Array.isArray(user.permissions)) {
      return user.permissions.includes(permission);
    }
    return hasPermission(user.role, permission);
  };
  const canView = has("import.view");
  return { canView, canManage: canView && has("import.manage") };
}

export function useCanManageImport(): boolean {
  return useImportAccess().canManage;
}

export function useImportConfig() {
  const { canView } = useImportAccess();
  return useQuery({
    queryKey: importKeys.config,
    queryFn: fetchImportConfig,
    staleTime: 5 * 60 * 1000,
    retry: 0,
    enabled: canView,
  });
}

/**
 * Hidden until the backend says Import is enabled and the user may view it
 * (fails closed). Every Import data hook waits on this.
 */
export function useImportEnabled(): boolean {
  const { canView } = useImportAccess();
  const { data } = useImportConfig();
  return canView && data?.enabled === true;
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
  const enabled = useImportEnabled();
  return useQuery({
    queryKey: importKeys.master,
    queryFn: fetchImportMaster,
    staleTime: 10 * 60 * 1000,
    enabled,
  });
}

export function useImportPaymentTerms(currencyCode?: string | null) {
  const enabled = useImportEnabled();
  return useQuery({
    queryKey: importKeys.paymentTerms(currencyCode ?? undefined),
    queryFn: () => fetchImportPaymentTerms(currencyCode ?? undefined),
    enabled: enabled && Boolean(currencyCode),
    staleTime: 10 * 60 * 1000,
  });
}

export function useImportListings(side: ImportSide, query: ListingQuery) {
  const enabled = useImportEnabled();
  return useQuery({
    queryKey: importKeys.listings(side, query),
    queryFn: () => fetchListings(side, query),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
    enabled,
  });
}

export function useImportListing(side: ImportSide, id: string | null) {
  const enabled = useImportEnabled();
  return useQuery({
    queryKey: importKeys.listing(side, id ?? ""),
    queryFn: () => fetchListing(side, id!),
    enabled: enabled && Boolean(id),
    staleTime: 0,
  });
}

export function useImportMatches(side: ImportSide, id: string, enabled = true) {
  const ready = useImportEnabled();
  return useQuery({
    queryKey: importKeys.matches(side, id),
    queryFn: () => fetchMatches(side, id),
    enabled: ready && enabled,
    staleTime: 15 * 1000,
  });
}

export function useImportDocuments(listingId: string, enabled = true) {
  const ready = useImportEnabled();
  return useQuery({
    queryKey: importKeys.documents(listingId),
    queryFn: () => fetchListingDocuments(listingId),
    enabled: ready && enabled,
    retry: 0,
  });
}

export function useImportNegotiations(
  query: Parameters<typeof fetchNegotiations>[0],
) {
  const enabled = useImportEnabled();
  return useQuery({
    queryKey: importKeys.negotiations(query),
    queryFn: () => fetchNegotiations(query),
    placeholderData: keepPreviousData,
    staleTime: 10 * 1000,
    enabled,
  });
}

export function useImportNegotiation(id: string) {
  const enabled = useImportEnabled();
  return useQuery({
    queryKey: importKeys.negotiation(id),
    queryFn: () => fetchNegotiation(id),
    staleTime: 0,
    refetchInterval: 30 * 1000,
    enabled,
  });
}

export function useImportDeals(query: Parameters<typeof fetchDeals>[0]) {
  const enabled = useImportEnabled();
  return useQuery({
    queryKey: importKeys.deals(query),
    queryFn: () => fetchDeals(query),
    placeholderData: keepPreviousData,
    staleTime: 10 * 1000,
    enabled,
  });
}

export function useImportDeal(id: string) {
  const enabled = useImportEnabled();
  return useQuery({
    queryKey: importKeys.deal(id),
    queryFn: () => fetchDeal(id),
    staleTime: 0,
    refetchOnWindowFocus: true,
    enabled,
  });
}

export function useImportShipments(query: ShipmentQuery) {
  const enabled = useImportEnabled();
  return useQuery({
    queryKey: importKeys.shipments(query),
    queryFn: () => listShipments(query),
    placeholderData: keepPreviousData,
    staleTime: 10 * 1000,
    enabled,
  });
}

export function useImportShipment(id: string | null) {
  const enabled = useImportEnabled();
  return useQuery({
    queryKey: importKeys.shipment(id ?? ""),
    queryFn: () => getShipment(id!),
    enabled: enabled && Boolean(id),
    staleTime: 0,
  });
}

export function useInvalidateImport() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: importKeys.all });
}

export function useCreateShipment() {
  const invalidate = useInvalidateImport();
  return useMutation({
    mutationFn: (vars: {
      dealId: string;
      body: ImportShipmentCreateInput;
      idempotencyKey: string;
    }) => createShipment(vars.dealId, vars.body, vars.idempotencyKey),
    onSettled: () => void invalidate(),
  });
}

export function useUpdateShipment() {
  const invalidate = useInvalidateImport();
  return useMutation({
    mutationFn: (vars: { id: string; body: ImportShipmentUpdateInput }) =>
      updateShipment(vars.id, vars.body),
    onSettled: () => void invalidate(),
  });
}

export function useAddShipmentEvent() {
  const invalidate = useInvalidateImport();
  return useMutation({
    mutationFn: (vars: { id: string; body: ImportShipmentEventInput }) =>
      addShipmentEvent(vars.id, vars.body),
    onSettled: () => void invalidate(),
  });
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
