"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  assignDispatchVehicle,
  completeDispatchLoading,
  dispatchApiError,
  executeSellerDispatch,
  fetchSellerDispatch,
  fetchSellerDispatchesPage,
  fetchSellerDispatchSummary,
  fetchSellerDispatchTimeline,
  startDispatchLoading,
  upsertDispatchEwayBill,
} from "@/services/seller-dispatches";
import type {
  AssignDispatchVehiclePayload,
  SellerDispatchListParams,
  UpsertDispatchEwayPayload,
} from "@/types/seller-dispatch";

export const sellerDispatchKeys = {
  all: ["seller-dispatches"] as const,
  list: (params: SellerDispatchListParams) =>
    [...sellerDispatchKeys.all, "list", params] as const,
  summary: () => [...sellerDispatchKeys.all, "summary"] as const,
  detail: (id: string) => [...sellerDispatchKeys.all, "detail", id] as const,
  timeline: (id: string) =>
    [...sellerDispatchKeys.all, "timeline", id] as const,
};

function invalidateDispatchQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: sellerDispatchKeys.all });
  // Keep vehicle slots / orders in sync after logistics mutations.
  void queryClient.invalidateQueries({ queryKey: ["vehicle-slots"] });
}

export function useSellerDispatches(params: SellerDispatchListParams) {
  return useQuery({
    queryKey: sellerDispatchKeys.list(params),
    queryFn: () => fetchSellerDispatchesPage(params),
    placeholderData: (prev) => prev,
  });
}

export function useSellerDispatchSummary() {
  return useQuery({
    queryKey: sellerDispatchKeys.summary(),
    queryFn: fetchSellerDispatchSummary,
  });
}

export function useSellerDispatch(id: string | null, enabled = true) {
  return useQuery({
    queryKey: sellerDispatchKeys.detail(id ?? ""),
    queryFn: () => fetchSellerDispatch(id!),
    enabled: enabled && Boolean(id),
  });
}

export function useSellerDispatchTimeline(id: string | null, enabled = true) {
  return useQuery({
    queryKey: sellerDispatchKeys.timeline(id ?? ""),
    queryFn: () => fetchSellerDispatchTimeline(id!),
    enabled: enabled && Boolean(id),
  });
}

export function useAssignDispatchVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AssignDispatchVehiclePayload;
    }) => assignDispatchVehicle(id, payload),
    onSuccess: () => invalidateDispatchQueries(queryClient),
  });
}

export function useUpsertDispatchEway() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpsertDispatchEwayPayload;
    }) => upsertDispatchEwayBill(id, payload),
    onSuccess: () => invalidateDispatchQueries(queryClient),
  });
}

export function useStartDispatchLoading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => startDispatchLoading(id),
    onSuccess: () => invalidateDispatchQueries(queryClient),
  });
}

export function useCompleteDispatchLoading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => completeDispatchLoading(id),
    onSuccess: () => invalidateDispatchQueries(queryClient),
  });
}

export function useExecuteSellerDispatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => executeSellerDispatch(id),
    onSuccess: () => invalidateDispatchQueries(queryClient),
  });
}

export { dispatchApiError };
