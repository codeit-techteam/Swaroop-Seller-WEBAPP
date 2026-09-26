"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  acceptSellerPriceRevision,
  counterSellerPriceRevision,
  fetchSellerPriceRevision,
  fetchSellerPriceRevisionsPage,
  fetchSellerPriceRevisionSummary,
  rejectSellerPriceRevision,
} from "@/services/price-revisions";
import type { SellerPriceRevisionListParams } from "@/types/seller-price-revision";

export const sellerPriceRevisionKeys = {
  all: ["seller-price-revisions"] as const,
  list: (params: SellerPriceRevisionListParams) =>
    [...sellerPriceRevisionKeys.all, "list", params] as const,
  summary: () => [...sellerPriceRevisionKeys.all, "summary"] as const,
  detail: (id: string) =>
    [...sellerPriceRevisionKeys.all, "detail", id] as const,
};

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({
    queryKey: sellerPriceRevisionKeys.all,
  });
}

export function useSellerPriceRevisions(params: SellerPriceRevisionListParams) {
  return useQuery({
    queryKey: sellerPriceRevisionKeys.list(params),
    queryFn: () => fetchSellerPriceRevisionsPage(params),
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: true,
  });
}

export function useSellerPriceRevisionSummary() {
  return useQuery({
    queryKey: sellerPriceRevisionKeys.summary(),
    queryFn: fetchSellerPriceRevisionSummary,
    refetchOnWindowFocus: true,
  });
}

export function useSellerPriceRevision(id: string | null, enabled = true) {
  return useQuery({
    queryKey: sellerPriceRevisionKeys.detail(id ?? ""),
    queryFn: () => fetchSellerPriceRevision(id!),
    enabled: Boolean(id) && enabled,
  });
}

export function useAcceptPriceRevision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message?: string }) =>
      acceptSellerPriceRevision(id, message),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useRejectPriceRevision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectSellerPriceRevision(id, reason),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useCounterPriceRevision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      counterPrice,
      message,
    }: {
      id: string;
      counterPrice: number;
      message?: string;
    }) => counterSellerPriceRevision(id, { counterPrice, message }),
    onSuccess: () => invalidateAll(queryClient),
  });
}
