"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchSellerSettlement,
  fetchSellerSettlementsPage,
  fetchSellerSettlementSummary,
  fetchSellerSettlementTimeline,
} from "@/services/settlements";
import type { SellerSettlementListParams } from "@/types/seller-settlement";

export const sellerSettlementKeys = {
  all: ["seller-settlements"] as const,
  list: (params: SellerSettlementListParams) =>
    [...sellerSettlementKeys.all, "list", params] as const,
  summary: () => [...sellerSettlementKeys.all, "summary"] as const,
  detail: (id: string) => [...sellerSettlementKeys.all, "detail", id] as const,
  timeline: (id: string) =>
    [...sellerSettlementKeys.all, "timeline", id] as const,
};

export function useInvalidateSellerSettlements() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: sellerSettlementKeys.all });
}

export function useSellerSettlements(params: SellerSettlementListParams) {
  return useQuery({
    queryKey: sellerSettlementKeys.list(params),
    queryFn: () => fetchSellerSettlementsPage(params),
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: true,
  });
}

export function useSellerSettlementSummary() {
  return useQuery({
    queryKey: sellerSettlementKeys.summary(),
    queryFn: fetchSellerSettlementSummary,
    refetchOnWindowFocus: true,
  });
}

export function useSellerSettlement(id: string | null, enabled = true) {
  return useQuery({
    queryKey: sellerSettlementKeys.detail(id ?? ""),
    queryFn: () => fetchSellerSettlement(id!),
    enabled: Boolean(id) && enabled,
  });
}

export function useSellerSettlementTimeline(id: string | null, enabled = true) {
  return useQuery({
    queryKey: sellerSettlementKeys.timeline(id ?? ""),
    queryFn: () => fetchSellerSettlementTimeline(id!),
    enabled: Boolean(id) && enabled,
  });
}
