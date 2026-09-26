"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  bookVehicleSlot,
  cancelVehicleSlot,
  exportVehicleSlots,
  fetchEligibleDispatches,
  fetchLoadingBays,
  fetchLogisticsDrivers,
  fetchLogisticsVehicles,
  fetchLogisticsWarehouses,
  fetchVehicleSlotAvailability,
  fetchVehicleSlotsPage,
  fetchVehicleSlotSummary,
  vehicleSlotApiError,
} from "@/services/vehicle-slots";
import type {
  BookVehicleSlotPayload,
  VehicleSlotListParams,
} from "@/types/vehicle-slots";

export const vehicleSlotKeys = {
  all: ["vehicle-slots"] as const,
  list: (params: VehicleSlotListParams) =>
    [...vehicleSlotKeys.all, "list", params] as const,
  summary: (date?: string) =>
    [...vehicleSlotKeys.all, "summary", date ?? "today"] as const,
  availability: (params: Record<string, string | undefined>) =>
    [...vehicleSlotKeys.all, "availability", params] as const,
  warehouses: () => [...vehicleSlotKeys.all, "warehouses"] as const,
  bays: (warehouseId: string) =>
    [...vehicleSlotKeys.all, "bays", warehouseId] as const,
  eligible: (search?: string) =>
    [...vehicleSlotKeys.all, "eligible", search ?? ""] as const,
  vehicles: (type?: string) =>
    [...vehicleSlotKeys.all, "vehicles", type ?? "all"] as const,
  drivers: () => [...vehicleSlotKeys.all, "drivers"] as const,
};

export function useVehicleSlots(params: VehicleSlotListParams) {
  return useQuery({
    queryKey: vehicleSlotKeys.list(params),
    queryFn: () => fetchVehicleSlotsPage(params),
    placeholderData: (prev) => prev,
  });
}

export function useVehicleSlotSummary(date?: string) {
  return useQuery({
    queryKey: vehicleSlotKeys.summary(date),
    queryFn: () => fetchVehicleSlotSummary(date),
  });
}

export function useVehicleSlotAvailability(
  params: {
    warehouseId: string;
    date: string;
    loadingBayId?: string;
    vehicleId?: string;
    vehicleType?: string;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: vehicleSlotKeys.availability(params),
    queryFn: () => fetchVehicleSlotAvailability(params),
    enabled: enabled && Boolean(params.warehouseId) && Boolean(params.date),
  });
}

export function useLogisticsWarehouses() {
  return useQuery({
    queryKey: vehicleSlotKeys.warehouses(),
    queryFn: fetchLogisticsWarehouses,
  });
}

export function useLoadingBays(warehouseId: string, enabled = true) {
  return useQuery({
    queryKey: vehicleSlotKeys.bays(warehouseId),
    queryFn: () => fetchLoadingBays(warehouseId),
    enabled: enabled && Boolean(warehouseId),
  });
}

export function useEligibleDispatches(search?: string, enabled = true) {
  return useQuery({
    queryKey: vehicleSlotKeys.eligible(search),
    queryFn: () => fetchEligibleDispatches(search),
    enabled,
  });
}

export function useLogisticsVehicles(vehicleType?: string, enabled = true) {
  return useQuery({
    queryKey: vehicleSlotKeys.vehicles(vehicleType),
    queryFn: () =>
      fetchLogisticsVehicles({
        vehicleType:
          vehicleType && vehicleType !== "all" ? vehicleType : undefined,
        vehicleStatus: "AVAILABLE",
      }),
    enabled,
  });
}

export function useLogisticsDrivers(enabled = true) {
  return useQuery({
    queryKey: vehicleSlotKeys.drivers(),
    queryFn: () => fetchLogisticsDrivers(),
    enabled,
  });
}

function invalidateSlotQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: vehicleSlotKeys.all });
}

export function useBookVehicleSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookVehicleSlotPayload) => bookVehicleSlot(payload),
    onSuccess: () => invalidateSlotQueries(queryClient),
  });
}

export function useCancelVehicleSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelVehicleSlot(id),
    onSuccess: () => invalidateSlotQueries(queryClient),
  });
}

export function useExportVehicleSlots() {
  return useMutation({
    mutationFn: (params: VehicleSlotListParams) => exportVehicleSlots(params),
  });
}

export { vehicleSlotApiError };
